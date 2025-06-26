import { promises as fs } from "fs";
import { parseChatLogFromText } from "../util/parse.js";
import { readStdin } from "../util/stdin.js";

export async function handleLog(
  input: string | undefined,
  opts: { file: string } = { file: "codey.md" },
) {
  let promptText = input;
  if (!promptText && !process.stdin.isTTY) {
    promptText = (await readStdin()).trim();
  }
  if (!promptText) {
    console.error("No prompt supplied (argument or stdin required).");
    process.exit(1);
  }

  let fileContent = "";
  try {
    fileContent = await fs.readFile(opts.file, "utf-8");
  } catch (err: unknown) {
    // what is the error? if file exists, but we failed to read it, then we
    // should log and exist. otherwise, we will create a new file later

    // @ts-ignore:
    if (err?.code === "ENOENT") {
      // File does not exist, we will create it later
      fileContent = "";
    } else {
      console.error(`Failed to read file ${opts.file}:`, err);
      process.exit(1);
    }
  }

  const { messages, settings } = parseChatLogFromText(fileContent);
  messages.push({
    role: "user",
    content: promptText,
  });
}
