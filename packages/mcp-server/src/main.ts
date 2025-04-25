import "dotenv/config"
import { FastMCP } from "fastmcp";
import {handleHederaInteraction} from "./modules/hedera-langchain.js";
import {Logger} from "@mcp/logger";
import {z} from "zod";

const server = new FastMCP({
  name: "Hedera MCP Server",
  version: "1.0.0",
  async authenticate(request) {
    const sessionId = crypto.randomUUID();

    const token = request.headers['x-mcp-auth-token'];

    // Parse the env variable as an array (assuming it's a comma-separated string)
    const validTokens = process.env.MCP_AUTH_TOKEN?.split(',').map(t => t.trim());

    if (!token || !validTokens || typeof token !== "string" || !validTokens.includes(token)) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    return { id: sessionId }
  }
});

// Tools registration
server.addTool({
  name: "interact-with-hedera",
  description: "Interact with Hedera",
  parameters: z.object({
    fullPrompt: z.string()
  }),
  execute: async ({ fullPrompt }, {session}) => {
    Logger.log("Received tool call: interact-with-hedera");
    return handleHederaInteraction(fullPrompt, process.env.API_URL, session?.id);
  }
})

const port = process.env.PORT || 3000;
void server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: Number(port)
  }
})