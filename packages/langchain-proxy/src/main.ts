import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import "dotenv/config";
import { createLangchain } from "./create-langchain.js";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to check X-LANGCHAIN-PROXY-TOKEN header
function verifyLangchainProxyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("X-LANGCHAIN-PROXY-TOKEN");
  if (!token || token !== process.env.LANGCHAIN_PROXY_TOKEN) {
    return res.status(401).json({
      content: [
        {
          type: "text",
          content: "Unauthorized: Invalid or missing X-LANGCHAIN-PROXY-TOKEN header"
        }
      ]
    });
  }
  next();
}

const langchain = createLangchain();

// Define the schema for the request body
const interactSchema = z.object({
  fullPrompt: z.string()
});

app.post("/interact-with-hedera", verifyLangchainProxyToken, async (req, res) => {
  console.log(req.body);

  try {
    const body = interactSchema.parse(req.body);
    const result = await langchain.invoke({
      messages: [new HumanMessage(body.fullPrompt)]
    }, {
      configurable: {
        thread_id: "MCP Server - langchain" // TODO: add separate thread id for each MCP Server Client
      }
    });

    const toolResponse = result.messages.find(m => m instanceof ToolMessage);
    if (!toolResponse) {
      throw new Error("No tool response found");
    }

    const responseText = toolResponse.content.toString();

    res.json({
      content: [{type: "object", content: JSON.parse(responseText)}]
    });
  } catch (e) {
    console.error(e);

    let errorString = "Unknown error";
    if (e instanceof Error) {
      errorString = e.toString();
    } else {
      errorString = String(e);
    }
    res.json({
      content: [{type: "text", content: `An error occurred while interacting with Hedera: ${errorString}`}]
    })
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
