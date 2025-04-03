import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import "dotenv/config"

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

server.tool("interact-with-hedera", {
  fullPrompt: z.string()
}, async ({ fullPrompt }) => {
  
  try {
    const response = await fetch("http://localhost:3000/interact-with-hedera", {
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

const transport = new StdioServerTransport();
void server.connect(transport);