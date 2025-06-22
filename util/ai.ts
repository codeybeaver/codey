import z from "zod/v4";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timeout")), ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export const ModelsSchema = z
  .enum([
    // anthropic
    "claude-3-5-sonnet-latest",
    "claude-3-7-sonnet-latest",
    "claude-sonnet-4-0",
    "claude-opus-4-0",

    // openai
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4o-mini-search-preview",
    "gpt-4o-search-preview",
    "o1",
    "o1-mini",
    "o3",
    "o3-mini",

    // x.ai
    "grok-3",
  ])
  .default("grok-3");

export const ProviderSchema = z
  .enum(["anthropic", "openai", "xai"])
  .default("xai");

const ModelToProviderMap: Record<string, z.infer<typeof ProviderSchema>> = {
  // anthropic models
  "claude-3-5-sonnet-latest": "anthropic",
  "claude-3-7-sonnet-latest": "anthropic",
  "claude-sonnet-4-0": "anthropic",
  "claude-opus-4-0": "anthropic",

  // openai models
  "gpt-4.1": "openai",
  "gpt-4.1-mini": "openai",
  "gpt-4.1-nano": "openai",
  "gpt-4o": "openai",
  "gpt-4o-mini": "openai",
  "gpt-4o-mini-search-preview": "openai",
  "gpt-4o-search-preview": "openai",
  o1: "openai",
  "o1-mini": "openai",
  o3: "openai",
  "o3-mini": "openai",

  // xai models
  "grok-3": "xai",
};

function getProvider(model: string): z.infer<typeof ProviderSchema> {
  const provider = ModelToProviderMap[model];
  if (!provider) {
    throw new Error(`No provider found for model: ${model}`);
  }
  return provider;
}

export async function generateChatCompletionStream({
  messages,
  model,
}: {
  messages: { role: "assistant" | "user" | "system"; content: string }[];
  model: string;
}) {
  let aiApi: OpenAI;
  let baseURL: string | undefined;
  let apiKey: string | undefined;

  // Determine the provider based on the model
  const provider = getProvider(model);

  if (provider === "xai") {
    apiKey = process.env.XAI_API_KEY;
    baseURL = "https://api.x.ai/v1";
    if (!apiKey) {
      throw new Error("XAI_API_KEY environment variable is not set.");
    }
  } else if (provider === "anthropic") {
    apiKey = process.env.ANTHROPIC_API_KEY;
    baseURL = "https://api.anthropic.com/v1";
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set.");
    }
  } else if (provider === "openai") {
    apiKey = process.env.OPENAI_API_KEY;
    // baseURL = "https://api.openai.com/v1";
    baseURL = undefined; // Use default OpenAI base URL
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  aiApi = new OpenAI({
    apiKey,
    baseURL,
  });

  try {
    const stream = await withTimeout(
      aiApi.chat.completions.create({
        model,
        messages,
        max_tokens: undefined,
        stream: true,
      }),
      30_000, // 30 seconds timeout
    );
    return stream;
  } catch (error) {
    console.error("Error generating chat completion:", error);
    throw error;
  }
}
