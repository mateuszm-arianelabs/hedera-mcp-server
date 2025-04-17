import express, { NextFunction, Request, Response } from "express";
import { z } from "zod";
import "dotenv/config";
import { createLangchain } from "./create-langchain.js";
import { HumanMessage } from "@langchain/core/messages";
import { Logger } from "@mcp/logger";

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to check X-LANGCHAIN-PROXY-TOKEN header
function verifyLangchainProxyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("X-LANGCHAIN-PROXY-TOKEN");
  if (!token || token !== process.env.LANGCHAIN_PROXY_TOKEN) {
    res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid or missing X-LANGCHAIN-PROXY-TOKEN header"
    });
    return;
  }
  next();
}

Logger.log("Initializing Langchain...");
const langchain = createLangchain();
Logger.log("Langchain initialized.");

// Define the schema for the request body
const interactSchema = z.object({
  fullPrompt: z.string()
});

app.post("/interact-with-hedera", verifyLangchainProxyToken, async (req, res) => {
  Logger.debug("Received request for /interact-with-hedera");
  Logger.debug("Request body:", req.body);

  try {
    const body = interactSchema.parse(req.body);
    Logger.log(`Invoking Langchain with prompt: ${body.fullPrompt.substring(0, 50)}...`);
    const isCustodial = req.header("X-CUSTODIAL-MODE") === 'true';

    const result = await langchain.invoke({
      messages: [new HumanMessage(body.fullPrompt)]
    }, {
      configurable: {
        thread_id: "MCP Server - langchain", // TODO: add separate thread id for each MCP Server Client
        isCustodial,
      }
    });

    const toolResponse = result.messages.find(
      m => m.constructor.name === "ToolMessage"
    );

    if (!toolResponse) {
      Logger.error("No tool response found in Langchain result.");
      throw new Error("No tool response found");
    }

    const responseText = toolResponse.content.toString();
    Logger.debug("Tool response text:", responseText);

    res.json({
      success: true,
      data: JSON.parse(responseText)
    });
    Logger.log("Successfully responded to /interact-with-hedera");
  } catch (e) {
    Logger.error("Error processing /interact-with-hedera request:", e);

    let errorString = "Unknown error";
    if (e instanceof Error) {
      errorString = e.toString();
    } else {
      errorString = String(e);
    }
    res.json({
      success: false,
      error: errorString
    })
  }
});

app.listen(port, () => {
  Logger.log(`Server listening on port ${port}`);
});
