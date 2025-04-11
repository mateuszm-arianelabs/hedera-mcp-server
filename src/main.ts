import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import "dotenv/config"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express"

// Helper function for the tool logic
export async function handleHederaInteraction(fullPrompt: string, apiUrl: string | undefined) {
  if (!apiUrl) {
    return {
      content: [{ type: "text" as const, text: "API_URL environment variable is not set." }]
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: JSON.stringify({
        fullPrompt
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    // Assuming the API returns an object that needs to be stringified for the MCP response
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }]
    };
  } catch (e) {
    let errorString: string;
    if (e instanceof Error) {
      errorString = e.toString();
    } else {
      errorString = String(e);
    }
    return {
      content: [{ type: "text" as const, text: `An error occurred while interacting with Hedera: ${errorString}` }]
    };
  }
}

// Create an MCP server
const server = new McpServer({
  name: "Hedera MCP Server",
  version: "1.0.0"
});

const app = express();

server.tool("interact-with-hedera", {
  fullPrompt: z.string()
}, async ({ fullPrompt }) => {
  return handleHederaInteraction(fullPrompt, process.env.API_URL);
})

// Communication layer

type SessionId = string;
// Handle multiple parallel sessions
const transports: Map<SessionId, SSEServerTransport> = new Map() 

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);
    res.on("close", () => {
        transports.delete(transport.sessionId);
    });
    await server.connect(transport);
});

// Main message handler
app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as SessionId;
    const transport = transports.get(sessionId);
    if (!transport) {
        res.status(404).send("Transport not found");
        return;
    }

    await transport.handlePostMessage(req, res);
});

const port = process.env.PORT || 3000;
app.listen(port);