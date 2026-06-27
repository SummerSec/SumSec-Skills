#!/usr/bin/env node

const { buildInstructions, resolveMode, MODES } = require("./instructions.cjs");

let input = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  input += chunk;
  pump();
});
process.stdin.on("end", () => {
  pump(true);
});

const state = {
  buffer: "",
  initialized: false,
};

function pump(flush = false) {
  state.buffer += input;
  input = "";

  while (true) {
    const headerEnd = state.buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      if (flush) state.buffer = "";
      return;
    }

    const header = state.buffer.slice(0, headerEnd);
    const lengthMatch = header.match(/Content-Length:\s*(\d+)/i);
    if (!lengthMatch) {
      state.buffer = state.buffer.slice(headerEnd + 4);
      continue;
    }

    const contentLength = Number(lengthMatch[1]);
    const totalLength = headerEnd + 4 + contentLength;
    if (state.buffer.length < totalLength) return;

    const body = state.buffer.slice(headerEnd + 4, totalLength);
    state.buffer = state.buffer.slice(totalLength);

    try {
      handleMessage(JSON.parse(body));
    } catch (error) {
      writeMessage({
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: "Parse error",
          data: String(error && error.message ? error.message : error),
        },
        id: null,
      });
    }
  }
}

function writeMessage(message) {
  const json = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`);
}

function ok(id, result) {
  writeMessage({ jsonrpc: "2.0", id, result });
}

function fail(id, code, message, data) {
  writeMessage({
    jsonrpc: "2.0",
    id,
    error: data === undefined ? { code, message } : { code, message, data },
  });
}

function getModeArg(raw) {
  const mode = raw && typeof raw.mode === "string" ? raw.mode : undefined;
  if (mode && !MODES.includes(mode.trim().toLowerCase())) {
    throw new Error(`Invalid mode "${mode}". Expected one of: ${MODES.join(", ")}`);
  }
  return mode;
}

function handleMessage(message) {
  const { id, method, params } = message || {};

  if (method === "notifications/initialized") {
    return;
  }

  if (method === "initialize") {
    state.initialized = true;
    return ok(id, {
      protocolVersion: "2025-03-26",
      capabilities: {
        prompts: { listChanged: false },
        tools: { listChanged: false },
      },
      serverInfo: {
        name: "ponytail",
        version: "0.1.0",
      },
    });
  }

  if (!state.initialized) {
    return fail(id ?? null, -32002, "Server not initialized");
  }

  switch (method) {
    case "ping":
      return ok(id, {});

    case "prompts/list":
      return ok(id, {
        prompts: [
          {
            name: "ponytail",
            title: "Ponytail mode",
            description:
              "Lazy senior dev instructions: YAGNI, stdlib first, and the smallest correct change.",
            arguments: [
              {
                name: "mode",
                description:
                  "Ponytail intensity: lite, full, or ultra. Omit to use the configured default.",
                required: false,
              },
            ],
          },
        ],
      });

    case "prompts/get": {
      try {
        if (!params || params.name !== "ponytail") {
          return fail(id, -32602, "Unknown prompt");
        }
        const mode = getModeArg(params.arguments || {});
        const instructions = buildInstructions(mode);
        return ok(id, {
          description:
            "Lazy senior dev instructions: YAGNI, stdlib first, and the smallest correct change.",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: instructions,
              },
            },
          ],
        });
      } catch (error) {
        return fail(id, -32602, "Invalid prompt arguments", String(error.message || error));
      }
    }

    case "tools/list":
      return ok(id, {
        tools: [
          {
            name: "ponytail_instructions",
            title: "Ponytail instructions",
            description:
              "Return the Ponytail ruleset for the given intensity (lite, full, or ultra).",
            inputSchema: {
              type: "object",
              properties: {
                mode: {
                  type: "string",
                  enum: MODES,
                  description:
                    "Ponytail intensity: lite, full, or ultra. Omit to use the configured default.",
                },
              },
              additionalProperties: false,
            },
            annotations: {
              readOnlyHint: true,
              openWorldHint: false,
            },
          },
        ],
      });

    case "tools/call": {
      try {
        if (!params || params.name !== "ponytail_instructions") {
          return fail(id, -32602, "Unknown tool");
        }
        const mode = getModeArg(params.arguments || {});
        const resolvedMode = resolveMode(mode);
        const instructions = buildInstructions(resolvedMode);
        return ok(id, {
          content: [{ type: "text", text: instructions }],
          structuredContent: {
            mode: resolvedMode,
            instructions,
          },
        });
      } catch (error) {
        return fail(id, -32602, "Invalid tool arguments", String(error.message || error));
      }
    }

    default:
      return fail(id ?? null, -32601, "Method not found");
  }
}
