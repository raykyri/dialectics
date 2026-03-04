#!/usr/bin/env npx tsx

// Parse /export files from Claude Code.
// Usage:
//   npx tsx parse_export.ts [2026-01-01-export.txt] output.json

import { readFileSync } from "fs";

interface ToolCall {
  tool: string;
  args: string;
  result: string;
  model?: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  tool_calls?: ToolCall[];
  duration?: string;
}

interface ChatExport {
  metadata: {
    model: string;
    user: string;
    working_directory: string;
    exported_at: string;
  };
  messages: Message[];
}

// Tool call patterns on ⏺ lines
// Note: Bash/Web Search args may span multiple lines — the closing ) may be on a later line.
// We handle that with a "partial" match and accumulation.
const TOOL_PATTERNS: { tool: string; regex: RegExp }[] = [
  { tool: "Bash", regex: /^Bash\((.+)\)$/ },
  { tool: "Write", regex: /^Write\((.+)\)$/ },
  { tool: "Read", regex: /^Read (.+)$/ },
  { tool: "Web Search", regex: /^Web Search\((.+)\)$/ },
  { tool: "Fetch", regex: /^Fetch\((.+)\)$/ },
  { tool: "Task Output", regex: /^Task Output (.+)$/ },
  { tool: "Agent", regex: /^Agent\((.+?)\)\s+(.+)$/ },
];

// Patterns that may start on one line without closing paren
const PARTIAL_TOOL_PATTERNS: { tool: string; regex: RegExp }[] = [
  { tool: "Bash", regex: /^Bash\((.+)$/ },
  { tool: "Web Search", regex: /^Web Search\((.+)$/ },
];

// Agent completion: ⏺ Agent "name" completed
const AGENT_COMPLETED_RE = /^Agent "(.+)" completed$/;

function parseMetadata(lines: string[]): ChatExport["metadata"] {
  const metadata: ChatExport["metadata"] = {
    model: "",
    user: "",
    working_directory: "",
    exported_at: new Date().toISOString().slice(0, 10),
  };

  // Scan header block (first ~12 lines with box-drawing chars)
  for (const line of lines.slice(0, 15)) {
    // "Opus 4.6 (1M context) · Claude Pro · Raymond Zhong"
    const infoLineMatch = line.match(/((?:Opus|Sonnet|Haiku)\s+[\d.]+).*·\s*(.+?)\s*│/);
    if (infoLineMatch) {
      metadata.model = infoLineMatch[1];
      // Last segment after final · is the user name
      const segments = line.split("·");
      if (segments.length >= 3) {
        metadata.user = segments[segments.length - 1].replace(/[│\s]+/g, " ").trim();
      }
    } else {
      // Fallback: model only
      const modelMatch = line.match(/((?:Opus|Sonnet|Haiku)\s+[\d.]+)/);
      if (modelMatch && !metadata.model) {
        metadata.model = modelMatch[1];
      }
    }
    // "Welcome back Raymond!" — fallback if no info line found
    if (!metadata.user) {
      const welcomeMatch = line.match(/Welcome back (.+?)!/);
      if (welcomeMatch) {
        metadata.user = welcomeMatch[1].trim();
      }
    }
    // "~/Development/dialectics" or similar path
    const dirMatch = line.match(/│\s+(~\/[^\s│]+|\/[^\s│]+)\s+│/);
    if (dirMatch) {
      metadata.working_directory = dirMatch[1].trim();
    }
  }

  return metadata;
}

function isHeaderLine(line: string): boolean {
  return /[╭╮╰╯│─]/.test(line);
}

function stripPrefix(line: string, prefix: string): string {
  // After the prefix character, content is typically indented with spaces
  const idx = line.indexOf(prefix);
  if (idx === -1) return line;
  return line.slice(idx + prefix.length).replace(/^\s/, "");
}

function parseToolCall(text: string): { call: ToolCall; partial: boolean } | null {
  for (const { tool, regex } of TOOL_PATTERNS) {
    const m = text.match(regex);
    if (m) {
      if (tool === "Agent") {
        return { call: { tool, args: m[1], result: "", model: m[2] }, partial: false };
      }
      return { call: { tool, args: m[1], result: "" }, partial: false };
    }
  }
  // Check for multiline tool calls (opening paren without closing)
  for (const { tool, regex } of PARTIAL_TOOL_PATTERNS) {
    const m = text.match(regex);
    if (m) {
      return { call: { tool, args: m[1], result: "" }, partial: true };
    }
  }
  return null;
}

type State = "idle" | "user" | "assistant" | "tool_call" | "tool_args_partial" | "tool_result";

function parse(input: string): ChatExport {
  const rawLines = input.split("\n");
  const metadata = parseMetadata(rawLines);
  const messages: Message[] = [];

  // Skip header block
  let startIdx = 0;
  for (let i = 0; i < rawLines.length; i++) {
    if (isHeaderLine(rawLines[i])) {
      startIdx = i + 1;
    } else if (startIdx > 0 && rawLines[i].trim() === "") {
      // Skip blank lines right after header
      startIdx = i + 1;
      break;
    }
  }

  let state: State = "idle";
  let currentContent: string[] = [];
  let currentToolCalls: ToolCall[] = [];
  let currentToolCall: ToolCall | null = null;

  function flushMessage() {
    if (state === "user" && currentContent.length > 0) {
      messages.push({
        role: "user",
        content: joinContent(currentContent),
      });
    } else if (
      state === "assistant" ||
      state === "tool_call" ||
      state === "tool_args_partial" ||
      state === "tool_result"
    ) {
      // Flush any pending tool result
      if (currentToolCall) {
        currentToolCalls.push(currentToolCall);
        currentToolCall = null;
      }
      const content = joinContent(currentContent);
      const msg: Message = { role: "assistant", content };
      if (currentToolCalls.length > 0) {
        msg.tool_calls = currentToolCalls;
      }
      if (content || (msg.tool_calls && msg.tool_calls.length > 0)) {
        messages.push(msg);
      }
    }
    currentContent = [];
    currentToolCalls = [];
    currentToolCall = null;
    state = "idle";
  }

  function joinContent(lines: string[]): string {
    // Trim trailing empty lines, join
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }
    return lines.join("\n").trim();
  }

  for (let i = startIdx; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Timing line: ✻ — attach as duration to preceding message
    if (line.startsWith("✻")) {
      flushMessage();
      if (messages.length > 0) {
        messages[messages.length - 1].duration = line.slice(1).trim();
      }
      continue;
    }

    // User message start: ❯
    if (line.startsWith("❯")) {
      flushMessage();
      state = "user";
      currentContent.push(stripPrefix(line, "❯"));
      continue;
    }

    // Tool result: ⎿ (indented under tool call)
    if (line.startsWith("  ⎿") || line.startsWith(" ⎿") || line.startsWith("⎿")) {
      // If we were accumulating partial args, the ⎿ means args are done
      if (state === "tool_args_partial" && currentToolCall) {
        // Strip trailing ) from args if present
        currentToolCall.args = currentToolCall.args.replace(/\)$/, "").replace(/…\)$/, "…");
        state = "tool_call";
      }
      const resultText = line.replace(/^\s*⎿\s?/, "");
      if (currentToolCall) {
        if (currentToolCall.result) {
          currentToolCall.result += "\n" + resultText;
        } else {
          currentToolCall.result = resultText;
        }
        state = "tool_result";
      }
      continue;
    }

    // Assistant or tool call: ⏺
    if (line.startsWith("⏺")) {
      const text = stripPrefix(line, "⏺");

      // Check for agent completion notification
      const agentCompleted = text.match(AGENT_COMPLETED_RE);
      if (agentCompleted) {
        // Flush any pending tool result
        if (currentToolCall) {
          currentToolCalls.push(currentToolCall);
          currentToolCall = null;
        }
        // If we're already building an assistant message, add as system inline
        // Otherwise create standalone system message
        if (state !== "assistant" && state !== "tool_call" && state !== "tool_result") {
          flushMessage();
        } else {
          // Flush current assistant message first
          flushMessage();
        }
        messages.push({
          role: "system",
          content: `Agent "${agentCompleted[1]}" completed`,
        });
        state = "idle";
        continue;
      }

      // Check for tool call
      const toolCallResult = parseToolCall(text);
      if (toolCallResult) {
        // If we're in idle or starting fresh, begin new assistant message
        if (state === "idle") {
          state = "tool_call";
        } else if (state === "user") {
          // Flush user, start assistant
          flushMessage();
          state = "tool_call";
        }
        // Flush previous tool call if any
        if (currentToolCall) {
          currentToolCalls.push(currentToolCall);
        }
        currentToolCall = toolCallResult.call;
        state = toolCallResult.partial ? "tool_args_partial" : "tool_call";
        continue;
      }

      // Plain assistant text
      if (state === "user") {
        flushMessage();
      }
      if (state === "idle") {
        state = "assistant";
        currentContent.push(text);
      } else if (state === "assistant") {
        // New ⏺ paragraph within same assistant turn
        currentContent.push("");
        currentContent.push(text);
      } else if (state === "tool_call" || state === "tool_args_partial" || state === "tool_result") {
        // Assistant text after tool calls — still same assistant turn
        // Flush tool call
        if (currentToolCall) {
          currentToolCalls.push(currentToolCall);
          currentToolCall = null;
        }
        state = "assistant";
        currentContent.push(text);
      }
      continue;
    }

    // Continuation lines (indented content for current block)
    if (state === "user") {
      // Continuation of user message — strip leading whitespace matching indent
      currentContent.push(line.replace(/^\s{1,2}/, ""));
    } else if (state === "assistant") {
      currentContent.push(line.replace(/^\s{1,2}/, ""));
    } else if (state === "tool_result" && currentToolCall) {
      // Indented file content lines (numbered: "     1 content")
      // or truncation indicators ("  … +86 lines")
      const trimmed = line.replace(/^\s+/, "");
      if (trimmed) {
        if (currentToolCall.result) {
          currentToolCall.result += "\n" + trimmed;
        } else {
          currentToolCall.result = trimmed;
        }
      }
    } else if ((state === "tool_call" || state === "tool_args_partial") && currentToolCall) {
      // Multiline tool args (e.g. Bash command spanning lines)
      const trimmed = line.replace(/^\s+/, "");
      if (trimmed) {
        // Check if this line closes the partial args (ends with ")")
        if (state === "tool_args_partial") {
          if (trimmed.endsWith(")")) {
            currentToolCall.args += " " + trimmed.slice(0, -1);
            state = "tool_call";
          } else {
            currentToolCall.args += " " + trimmed;
          }
        } else {
          currentToolCall.args += " " + trimmed;
        }
      }
    }
    // Blank lines in idle state — skip
  }

  flushMessage();
  return { metadata, messages };
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: npx tsx parse_chat.ts <export_file> [output_file]");
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1]; // optional

const input = readFileSync(inputFile, "utf-8");
const result = parse(input);

// Try to extract date from filename (e.g. "2026-03-03-185851-...")
const dateMatch = inputFile.match(/(\d{4}-\d{2}-\d{2})/);
if (dateMatch) {
  result.metadata.exported_at = dateMatch[1];
}
const json = JSON.stringify(result, null, 2);

if (outputFile) {
  const { writeFileSync } = require("fs");
  writeFileSync(outputFile, json, "utf-8");
  console.error(`Wrote ${result.messages.length} messages to ${outputFile}`);
} else {
  console.log(json);
}
