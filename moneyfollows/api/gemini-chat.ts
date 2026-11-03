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

const fallbackModels = [modelChoices.flash38, modelChoices.flash36, modelChoices.lite];
const retryableStatuses = new Set([400, 404, 408, 409, 429, 500, 502, 503, 504]);

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

  const callGemini = async (modelName: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        body: requestBody,
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const modelQueue = Array.from(new Set([selectedModel, ...fallbackModels]));
  let data: any = null;
  let usedModel = "";
  const failures: string[] = [];

  for (const modelName of modelQueue) {
    try {
      const response = await callGemini(modelName);
      if (response.ok) {
        data = await response.json();
        usedModel = modelName;
        break;
      }

      const detail = await response.text();
      failures.push(`${modelName}: ${response.status}`);
      if (!retryableStatuses.has(response.status)) {
        res.status(response.status).json({ error: "Gemini request failed.", detail });
        return;
      }
    } catch (error) {
      failures.push(`${modelName}: ${error instanceof Error && error.name === "AbortError" ? "timeout" : "network"}`);
    }
  }

  if (!data) {
    res.status(503).json({ error: "Gemini request failed across all available MoneyFollows models.", detail: failures.join(" | ") });
    return;
  }

  const text = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("").trim();
  res.status(200).json({ model: usedModel, text: text || "I could not produce a useful answer for that. Try asking in a simpler way." });
}
