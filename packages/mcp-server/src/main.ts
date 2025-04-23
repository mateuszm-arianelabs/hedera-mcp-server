import "dotenv/config"
import { FastMCP } from "fastmcp";
import {hederaLangchainTool} from "./modules/hedera-langchain.js";
import {Logger} from "@mcp/logger";

const server = new FastMCP({
  name: "Hedera MCP Server",
  version: "1.0.0",
  async authenticate(request) {
    const token = request.headers['x-mcp-auth-token'];
    Logger.log(`token: ${token}`);

    // Parse the env variable as an array (assuming it's a comma-separated string)
    const validTokens = process.env.MCP_AUTH_TOKEN?.split(',').map(t => t.trim());
    Logger.log(`validTokens: ${validTokens}`);

    if (!token || !validTokens || typeof token !== "string" || !validTokens.includes(token)) {
      throw new Response(null, {
        status: 401,
        statusText: "Unauthorized",
      });
    }

    return {token}
  }
});

// Tools registration
server.addTool(hederaLangchainTool)

const port = process.env.PORT || 3000;
void server.start({
  transportType: "sse",
  sse: {
    endpoint: "/sse",
    port: Number(port)
  }
})