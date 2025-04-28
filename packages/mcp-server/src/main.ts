import "dotenv/config"
import * as fastmcp from "fastmcp";
import { FastMCP } from "fastmcp";
import { Logger } from "@mcp/logger";
import { z } from "zod";
import { handleHederaInteraction } from "./modules/hedera-langchain.js";

const server = new FastMCP({
  name: "Hedera MCP Server",
  version: "1.0.0",
  async authenticate(request) {
    const sessionId = crypto.randomUUID();

    const accountId = request.headers['x-hedera-account-id'] as string | undefined;

    if (!accountId) {
      throw new Response(null, {
        status: 400,
        statusText: "Missing X-HEDERA-ACCOUNT-ID header",
      });
    }

    if (process.env.ENABLE_AUTH === 'false') {
      return { id: sessionId, accountId };
    }

    const token = request.headers['x-mcp-auth-token'];

    // Parse the env variable as an array (assuming it's a comma-separated string)
    const validTokens = process.env.MCP_AUTH_TOKEN?.split(',').map(t => t.trim());

    if (!token || !validTokens || typeof token !== "string" || !validTokens.includes(token)) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    return { id: sessionId, accountId };
  }
});

// Tools registration
server.addTool({
  name: "interact-with-hedera",
  description: "Interact with Hedera",
  parameters: z.object({
    fullPrompt: z.string(),
  }),
  execute: async ({ fullPrompt }, context) => {
    Logger.log("Received tool call: interact-with-hedera");

    const accountId = context.session?.accountId;

    if (!accountId) {
      Logger.error("Session missing accountId");
      throw new Error("Session is missing accountId.");
    }

    return handleHederaInteraction(fullPrompt, accountId, process.env.API_URL, context.session?.id);
  }
});

const port = process.env.PORT || 3000;
void server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: Number(port)
  }
})

class FastMCPSession extends fastmcp.FastMCPSession {
  originalEmit = fastmcp.FastMCPSession.prototype.emit;
}

Object.defineProperty(fastmcp.FastMCPSession.prototype, "originalEmit", {
  value: fastmcp.FastMCPSession.prototype.emit,
  writable: false,
});

// suppress error event
fastmcp.FastMCPSession.prototype.emit = function (
  this: FastMCPSession,
  event: any,
  ...args: any[]
) {
  if (event !== "error") {
    return this.originalEmit(event, ...args);
  }
};