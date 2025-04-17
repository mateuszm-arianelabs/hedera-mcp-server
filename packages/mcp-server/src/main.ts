import "dotenv/config"
import { FastMCP } from "fastmcp";
import {hederaLangchainTool} from "./modules/hedera-langchain.js";

const server = new FastMCP({
  name: "Hedera MCP Server",
  version: "1.0.0",
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