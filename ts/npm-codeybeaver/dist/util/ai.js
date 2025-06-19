import z from "zod/v4";
import { OpenAI } from "openai";
async function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout")), ms);
        promise.then((val) => {
            clearTimeout(timer);
            resolve(val);
        }, (err) => {
            clearTimeout(timer);
            reject(err);
        });
    });
}
const ModelsSchema = z
    .enum([
    "grok-3-beta",
    "grok-3",
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
])
    .default("grok-3");
// Update the generateChatCompletionStream function to handle multiple providers
export async function generateChatCompletionStream({ messages, model, }) {
    let aiApi;
    let baseURL;
    let apiKey;
    let modelName;
    if (model === "grok-3-beta") {
        apiKey = process.env.XAI_API_KEY;
        baseURL = "https://api.x.ai/v1";
        modelName = "grok-3-beta";
        if (!apiKey) {
            throw new Error("XAI_API_KEY environment variable is not set.");
        }
    }
    else {
        apiKey = process.env.OPENAI_API_KEY;
        // baseURL = "https://api.openai.com/v1";
        baseURL = undefined; // Use default OpenAI base URL
        modelName = "gpt-4.1";
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set.");
        }
    }
    aiApi = new OpenAI({
        apiKey,
        baseURL,
    });
    try {
        const stream = await withTimeout(aiApi.chat.completions.create({
            model: modelName,
            messages,
            max_tokens: undefined,
            stream: true,
        }), 30_000);
        return stream;
    }
    catch (error) {
        console.error("Error generating chat completion:", error);
        throw error;
    }
}
