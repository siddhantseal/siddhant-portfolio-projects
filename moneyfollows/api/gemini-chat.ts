/// <reference types="node" />

type GeminiRequest = {
  context?: Record<string, unknown>;
  mode?: "fast" | "balanced" | "deep";
  question?: string;
};

const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Gemini is not configured." });
    return;
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}) as GeminiRequest;
  const question = String(body.question || "").trim();
  if (!question) {
    res.status(400).json({ error: "Question is required." });
    return;
  }

  const style = body.mode === "deep"
    ? "Give a detailed but concise numbered plan."
    : body.mode === "fast"
      ? "Answer in 3 short bullets."
      : "Give a balanced practical answer in 4-6 bullets.";

  const prompt = [
    "You are MoneyFollows AI, a practical personal finance coach inside a money management app.",
    "Use the user's app data below. Do not invent transactions. Do not give investment, legal, or tax guarantees.",
    "Focus on saving money, setting goals, budgets, reminders, debt/payable/receivable tracking, and daily habits.",
    style,
    `App data JSON: ${JSON.stringify(body.context || {})}`,
    `User question: ${question}`
  ].join("\n\n");

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: body.mode === "deep" ? 700 : 360,
        temperature: 0.45
      }
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  if (!response.ok) {
    const detail = await response.text();
    res.status(response.status).json({ error: "Gemini request failed.", detail });
    return;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
  res.status(200).json({ text: text || "I could not produce a useful answer for that. Try asking in a simpler way." });
}
