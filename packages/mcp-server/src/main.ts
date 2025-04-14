import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import "dotenv/config"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express"
import { Logger } from "@mcp/logger";

// Helper function for the tool logic
export async function handleHederaInteraction(fullPrompt: string, apiUrl: string | undefined) {
  Logger.debug(`Handling Hedera interaction with prompt: ${fullPrompt.substring(0, 50)}...`);
  if (!apiUrl) {
    Logger.error("API_URL environment variable is not set.");
    return {
      content: [{type: "text" as const, text: "API_URL environment variable is not set."}]
    };
  }

  Logger.log(`Forwarding request to Langchain proxy: ${apiUrl}`);
  try {
    const token = process.env.LANGCHAIN_PROXY_TOKEN;

    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        fullPrompt
      }),
      headers: {
        "Content-Type": "application/json",
        "X-LANGCHAIN-PROXY-TOKEN": token || ""
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      Logger.error(`API request failed with status ${response.status}: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    Logger.debug("Received response from Langchain proxy:", data);

    // Assuming the API returns an object that needs to be stringified for the MCP response
    return {
      content: [{type: "text" as const, text: JSON.stringify(data)}]
    };
  } catch (e) {
    Logger.error("Error during Hedera interaction handling:", e);
    let errorString: string;
    if (e instanceof Error) {
      errorString = e.toString();
    } else {
      errorString = String(e);
    }
    return {
      content: [{type: "text" as const, text: `An error occurred while interacting with Hedera: ${errorString}`}]
    };
  }
}

// Create an MCP server
Logger.log("Creating MCP server...");
const server = new McpServer({
  name: "Hedera MCP Server",
  version: "1.0.0"
});
Logger.log("MCP server created.");

const app = express();

server.tool("interact-with-hedera", {
  fullPrompt: z.string()
}, async ({ fullPrompt }) => {
  Logger.log("Received tool call: interact-with-hedera");
  return handleHederaInteraction(fullPrompt, process.env.API_URL);
})
Logger.log("Registered tool: interact-with-hedera");

// Communication layer
type SessionId = string;
const transports: Map<SessionId, SSEServerTransport> = new Map()

app.get("/sse", async (req, res) => {
  const token = req.headers['x-mcp-auth-token'];
  Logger.log(`token: ${token}`);

  // Parse the env variable as an array (assuming it's a comma-separated string)
  const validTokens = process.env.MCP_AUTH_TOKEN?.split(',').map(t => t.trim());
  Logger.log(`validTokens: ${validTokens}`);

  if (!token || !validTokens || !validTokens.includes(token as string)) {
    res.status(401).json({
      content: [
        {
          type: "text",
          content: "Unauthorized: Invalid or missing X-MCP-AUTH-TOKEN header"
        }
      ]
    });
    return;
  }

  const transport = new SSEServerTransport('/messages', res);
  transports.set(transport.sessionId, transport);
    Logger.log(`New SSE connection established. Session ID: ${transport.sessionId}`);
  res.on("close", () => {
      Logger.log(`SSE connection closed. Session ID: ${transport.sessionId}`);
      transports.delete(transport.sessionId);
  });
  await server.connect(transport);
});

// Main message handler
app.post("/messages", async (req, res) => {
  const sessionId = req.query.sessionId as SessionId;
  Logger.debug(`Received POST /messages for session ID: ${sessionId}`);
  const transport = transports.get(sessionId);
  if (!transport) {
      Logger.warn(`Transport not found for session ID: ${sessionId}`);
      res.status(404).send("Transport not found");
    return;
  }

  await transport.handlePostMessage(req, res);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  Logger.log(`MCP Server listening on port ${port}`);
});