import { NextResponse } from "next/server";

type ContactRequest = {
  name?: string;
  email?: string;
  message?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value: string) {
  return value.replace(/[<>]/g, "").trim();
}

async function sendEmail(payload: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL ?? "SealCart Support <onboarding@resend.dev>";

  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      message: "Support ticket received. Email delivery is waiting for the mail provider connection."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: "Email service rejected the message. Check the sender domain and API key."
    };
  }

  return { ok: true, status: 200, message: "Email sent." };
}

export async function POST(request: Request) {
  let body: ContactRequest;

  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json({ message: "Invalid contact request." }, { status: 400 });
  }

  const name = sanitize(body.name ?? "");
  const email = sanitize(body.email ?? "").toLowerCase();
  const message = sanitize(body.message ?? "");
  const ticketId = `SC-${Date.now().toString(36).toUpperCase()}`;

  if (!name || !email || !message) {
    return NextResponse.json({ message: "Please fill name, email, and message." }, { status: 400 });
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }

  const customerEmail = await sendEmail({
    to: email,
    subject: `SealCart support received your message (${ticketId})`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172026">
        <h2>Hi ${name},</h2>
        <p>Thanks for contacting SealCart support. We received your message and will get back to you soon.</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <hr style="border:none;border-top:1px solid #d9e0e6;margin:20px 0" />
        <p style="color:#68727d;font-size:13px">This confirmation was sent from the SealCart contact form.</p>
      </div>
    `
  });

  if (!customerEmail.ok) {
    return NextResponse.json({
      message: `Support ticket ${ticketId} received. Our team will contact you at ${email}.`,
      ticketId,
      emailDelivered: false
    });
  }

  const ownerEmail = process.env.CONTACT_TO_EMAIL;
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `New SealCart support message ${ticketId} from ${name}`,
      replyTo: email,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172026">
          <h2>New support request</h2>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `
    });
  }

  return NextResponse.json({
    message: `Message sent. Ticket ${ticketId} confirmation has been delivered to your inbox.`,
    ticketId,
    emailDelivered: true
  });
}
