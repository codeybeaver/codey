import { generateChatCompletionStream } from "../util/ai.js";
import { parseChatLogFromText } from "../util/parse.js";

export async function handlePrompt({
  prompt,
  model,
  chunk,
  addDelimiters,
}: {
  prompt: string;
  model?: string;
  chunk?: boolean;
  addDelimiters?: boolean;
}) {
  const { messages, settings } = parseChatLogFromText(prompt);
  try {
    const stream = await generateChatCompletionStream({
      messages,
      model: model || settings.model,
    });

    async function* withTimeout<T>(
      src: AsyncIterable<T>,
      ms: number,
    ): AsyncIterable<T> {
      for await (const chunk of src) {
        yield await Promise.race([
          Promise.resolve(chunk),
          new Promise<T>((_, rej) =>
            setTimeout(() => rej(new Error("Chunk timeout")), ms),
          ),
        ]);
      }
    }

    if (addDelimiters) {
      if (chunk) {
        process.stdout.write(
          `${JSON.stringify({ chunk: `${settings.delimiterPrefix}${settings.assistantDelimiter}${settings.delimiterSuffix}` })}\n`,
        );
      } else {
        process.stdout.write(
          `${settings.delimiterPrefix}${settings.assistantDelimiter}${settings.delimiterSuffix}`,
        );
      }
    }

    for await (const textChunk of withTimeout(stream, 15_000)) {
      if (textChunk) {
        // Replace 'chunk' with your desired flag or variable
        if (chunk) {
          process.stdout.write(`${JSON.stringify({ chunk: textChunk })}\n`);
        } else {
          process.stdout.write(textChunk);
        }
      }
    }

    if (addDelimiters) {
      if (chunk) {
        process.stdout.write(
          `${JSON.stringify({ chunk: `${settings.delimiterPrefix}${settings.userDelimiter}${settings.delimiterSuffix}` })}\n`,
        );
      } else {
        process.stdout.write(
          `${settings.delimiterPrefix}${settings.userDelimiter}${settings.delimiterSuffix}`,
        );
      }
    }

    if (!chunk) {
      process.stdout.write("\n");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error generating chat completion:", err);
    process.exit(1);
  }
}
