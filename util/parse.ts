import * as TOML from "@iarna/toml";
import YAML from "yaml";
import { z } from "zod";

const SettingsSchema = z.object({
  delimiterPrefix: z.string().default("\n\n"),
  delimiterSuffix: z.string().default("\n\n"),
  userDelimiter: z.string().default("# === USER ==="),
  assistantDelimiter: z.string().default("# === ASSISTANT ==="),
  systemDelimiter: z.string().default("# === SYSTEM ==="),
  model: z.string().default("grok-3"),
});
function parseFrontMatter(text: string) {
  const tomlMatch = text.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
  if (tomlMatch) {
    try {
      return TOML.parse(tomlMatch[1] || "");
    } catch (e) {
      console.error("Invalid TOML front matter:", e);
    }
  }
  const yamlMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    try {
      return YAML.parse(yamlMatch[1] || "");
    } catch (e) {
      console.error("Invalid YAML front matter:", e);
    }
  }
  return {};
}

export function getSettingsFromFrontMatter(text: string) {
  const frontMatter = parseFrontMatter(text);
  if (frontMatter && typeof frontMatter === "object") {
    return SettingsSchema.parse(frontMatter);
  }
  return SettingsSchema.parse({});
}

export function parseText(text: string) {
  // Remove front matter if it exists
  const tomlMatch = text.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
  if (tomlMatch) {
    return text.replace(tomlMatch[0], "").trim();
  }
  const yamlMatch = text.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    return text.replace(yamlMatch[0], "").trim();
  }
  return text;
}

export function parseChatLog(
  text: string,
  settings: {
    delimiterPrefix: string;
    delimiterSuffix: string;
    userDelimiter: string;
    assistantDelimiter: string;
    systemDelimiter: string;
  },
): { role: "user" | "assistant" | "system"; content: string }[] {
  const {
    delimiterPrefix,
    delimiterSuffix,
    userDelimiter,
    assistantDelimiter,
    systemDelimiter,
  } = settings;

  const delimiters = [
    {
      role: "user",
      delim: `${delimiterPrefix}${userDelimiter}${delimiterSuffix}`,
    },
    {
      role: "assistant",
      delim: `${delimiterPrefix}${assistantDelimiter}${delimiterSuffix}`,
    },
    {
      role: "system",
      delim: `${delimiterPrefix}${systemDelimiter}${delimiterSuffix}`,
    },
  ];

  // Build a regex to match any delimiter
  const delimRegex = new RegExp(
    `(${delimiters.map((d) => d.delim.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );

  // Split text into blocks and delimiters
  const parts = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(delimRegex, "g");

  match = regex.exec(text);
  while (match !== null) {
    if (match.index > lastIndex) {
      parts.push({ content: text.slice(lastIndex, match.index), delim: null });
    }
    parts.push({ content: "", delim: match[0] });
    lastIndex = regex.lastIndex;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    parts.push({ content: text.slice(lastIndex), delim: null });
  }

  // Now, walk through parts and assign roles
  const chatLog: { role: "user" | "assistant" | "system"; content: string }[] =
    [];
  let currentRole: "user" | "assistant" | "system" = "user";
  let first = true;
  for (let i = 0; i < parts.length; i++) {
    const { content, delim } = parts[i] as {
      content: string;
      delim: string | null;
    };
    if (first) {
      // If first block is empty or whitespace, and next is a system delimiter, treat as system
      if (
        content.trim().length === 0 &&
        parts[i + 1]?.delim ===
          `${delimiterPrefix}${systemDelimiter}${delimiterSuffix}`
      ) {
        currentRole = "system";
        first = false;
        continue;
      }
      // Otherwise, first block is user
      if (content.trim().length > 0) {
        chatLog.push({ role: "user", content: content });
      }
      first = false;
      continue;
    }
    if (delim) {
      // Find which role this delimiter is for
      const found = delimiters.find((d) => d.delim === delim);
      if (found) {
        currentRole = found.role as "user" | "assistant" | "system";
      }
      // Next part (if any) is the content for this role
      if (
        parts[i + 1] &&
        (
          parts[i + 1] as { content: string; delim: string | null }
        ).content.trim().length > 0
      ) {
        chatLog.push({
          role: currentRole,
          content: (parts[i + 1] as { content: string; delim: string | null })
            .content,
        });
      }
    }
  }
  return chatLog;
}
