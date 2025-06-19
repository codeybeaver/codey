#!/usr/bin/env node
import { Command } from "commander";
import { generateChatCompletionStream } from "./util/ai.js";
const program = new Command();
async function readStdin() {
    const chunks = [];
    return new Promise((resolve, reject) => {
        process.stdin.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8").trim()));
        process.stdin.on("error", reject);
    });
}
async function handlePrompt(prompt) {
    try {
        const stream = await generateChatCompletionStream({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "grok-3", // Pass the selected model from settings (parameterize if needed)
        });
        async function* withStreamTimeout(stream, ms) {
            for await (const chunkPromise of stream) {
                yield await Promise.race([
                    Promise.resolve(chunkPromise),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Chunk timeout")), ms)),
                ]);
            }
        }
        // 15s timeout per chunk
        for await (const chunk of withStreamTimeout(stream, 15000)) {
            if (chunk.choices[0]?.delta.content) {
                process.stdout.write(chunk.choices[0].delta.content);
            }
        }
        process.stdout.write("\n");
        process.exit(0);
    }
    catch (error) {
        console.error("Error generating chat completion:", error);
        process.exit(1);
    }
}
program
    .command("prompt [input]")
    .description("Send a prompt to the LLM (from arg or stdin)")
    .action(async (input) => {
    if (input) {
        // Argument prompt
        await handlePrompt(input);
    }
    else if (!process.stdin.isTTY) {
        // stdin is not a terminal => input is being piped in
        const stdinInput = (await readStdin()).trim();
        if (stdinInput.length > 0) {
            await handlePrompt(stdinInput);
        }
        else {
            console.error("No input provided via stdin or as argument.");
            process.exit(1);
        }
    }
    else {
        // No input at all
        console.error("No prompt input given. Use an argument or pipe input.");
        process.exit(1);
    }
});
program.parse();
