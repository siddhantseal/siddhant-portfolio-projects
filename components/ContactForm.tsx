"use client";

import { type FormEvent, useState } from "react";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = (await response.json()) as { message?: string; ticketId?: string; emailDelivered?: boolean };

      if (!response.ok) {
        setState("error");
        setStatusMessage(data.message ?? "We could not send the message. Please try again.");
        return;
      }

      setState("success");
      setStatusMessage(data.message ?? "Message sent. Please check your email inbox.");
      if (data.ticketId) {
        try {
          const savedTickets = JSON.parse(window.localStorage.getItem("sealcart-support-tickets") ?? "[]");
          window.localStorage.setItem(
            "sealcart-support-tickets",
            JSON.stringify([
              {
                id: data.ticketId,
                email: form.email,
                message: form.message,
                emailDelivered: Boolean(data.emailDelivered),
                createdAt: new Date().toISOString()
              },
              ...savedTickets
            ].slice(0, 10))
          );
        } catch {
          // Ticket history is a convenience for this browser.
        }
      }
      setForm({ name: "", email: "", message: "" });
    } catch {
      setState("error");
      setStatusMessage("Network error. Please try again in a moment.");
    }
  }

  return (
    <form className="contactForm" onSubmit={submitContact}>
      <label>
        Name
        <input
          placeholder="Your name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          placeholder="you@example.com"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </label>
      <label>
        Message
        <textarea
          placeholder="How can we help?"
          rows={5}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
        />
      </label>
      <button className="button primary" disabled={state === "sending"} type="submit">
        {state === "sending" ? "Sending..." : "Send message"}
      </button>
      {statusMessage ? (
        <p className={`contactStatus ${state === "success" ? "success" : "error"}`}>
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
