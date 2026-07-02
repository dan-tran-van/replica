import type { z } from "zod";

export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "OpenAIError";
  }
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

export async function callOpenAIJson<T>(
  apiKey: string,
  model: string,
  system: string,
  user: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok) {
    const message =
      data.error?.message ?? `OpenAI request failed (${response.status})`;
    throw new OpenAIError(message, response.status);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenAIError("Empty response from OpenAI");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new OpenAIError("Malformed JSON in OpenAI response");
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new OpenAIError("OpenAI response did not match expected schema");
  }

  return result.data;
}
