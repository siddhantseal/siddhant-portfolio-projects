/// <reference types="node" />

type GeminiRequest = {
  context?: Record<string, unknown>;
  history?: Array<{ role?: "assistant" | "user"; text?: string }>;
  mode?: "fast" | "balanced" | "deep";
  model?: "argon" | "deep" | "flash36" | "flash38" | "latest" | "lite" | "smart";
  question?: string;
};

const modelChoices = {
  argon: process.env.GEMINI_ARGON_MODEL || process.env.GEMINI_DEEP_MODEL || "gemini-4-argon",
  deep: process.env.GEMINI_ARGON_MODEL || process.env.GEMINI_DEEP_MODEL || "gemini-4-argon",
  flash36: process.env.GEMINI_FLASH36_MODEL || "gemini-3.6-flash",
  flash38: process.env.GEMINI_FLASH38_MODEL || process.env.GEMINI_MODEL || process.env.GEMINI_SMART_MODEL || "gemini-3.8-flash",
  latest: process.env.GEMINI_LATEST_MODEL || "gemini-flash-latest",
  lite: process.env.GEMINI_LITE_MODEL || "gemini-3.5-flash-lite",
  smart: process.env.GEMINI_FLASH38_MODEL || process.env.GEMINI_MODEL || process.env.GEMINI_SMART_MODEL || "gemini-3.8-flash"
} as const;

const fallbackModel = modelChoices.flash38;

function toGeminiHistory(history: GeminiRequest["history"], question: string) {
  const priorMessages = (history || [])
    .filter((message) => message.text && (message.role === "assistant" || message.role === "user"))
    .slice(-10)
    .map((message) => ({
      parts: [{ text: String(message.text).slice(0, 2400) }],
      role: message.role === "assistant" ? "model" : "user"
    }));

  return [
    ...priorMessages,
    {
      parts: [{ text: question }],
      role: "user"
    }
  ];
}

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

  const selectedModel = modelChoices[body.model || "flash38"];
  const systemPrompt = [
    "You are MoneyFollows AI, a practical personal finance coach inside a money management app.",
    "Use the user's app data below. Do not invent transactions. Do not give investment, legal, or tax guarantees.",
    "If the user asks to add a goal, budget, reminder, income, expense, or borrowed money record, explain the setup and suggest the relevant one-tap action if available.",
    "Keep answers friendly, direct, and easy for a normal person to follow day to day.",
    "Focus on saving money, setting goals, budgets, reminders, debt/payable/receivable tracking, and daily habits.",
    style,
    `Current MoneyFollows app data JSON: ${JSON.stringify(body.context || {})}`
  ].join("\n\n");

  const requestBody = JSON.stringify({
      contents: toGeminiHistory(body.history, question),
      generationConfig: {
        maxOutputTokens: body.mode === "deep" ? 850 : 460,
        temperature: 0.45
      },
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    });

  const callGemini = (modelName: string) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
    body: requestBody,
    headers: { "Content-Type": "application/json" },
    method: "POST"
  });

  let response = await callGemini(selectedModel);

  if (!response.ok && selectedModel !== fallbackModel && [400, 404].includes(response.status)) {
    response = await callGemini(fallbackModel);
  }

  if (!response.ok) {
    const detail = await response.text();
    res.status(response.status).json({ error: "Gemini request failed.", detail });
    return;
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
  res.status(200).json({ model: selectedModel, text: text || "I could not produce a useful answer for that. Try asking in a simpler way." });
}
