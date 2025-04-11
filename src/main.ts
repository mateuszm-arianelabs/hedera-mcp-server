import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import "dotenv/config"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express"

// Create an MCP server
const server = new McpServer({
  name: "Hedera MCP Server",
  version: "1.0.0"
});

const app = express();

server.tool("interact-with-hedera", {
  fullPrompt: z.string()
}, async ({ fullPrompt }) => {
  
  try {
    const response = await fetch(`${process.env.API_URL}/interact-with-hedera`, {
      method: "POST",
      body: JSON.stringify({
        fullPrompt
      }),
      headers: {
        "Content-Type": "application/json"
      }
    })

    const data = await response.json();

    return {
      content: [{ type: "text", text: JSON.stringify(data) }]
    }
  } catch (e) {
    let errorString: string;
    if (e instanceof Error) {
      errorString = e.toString();
    } else {
      errorString = String(e);
    }
    return {
      content: [{ type: "text", text: `An error occurred while interacting with Hedera: ${errorString}` }]
    }
  }
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