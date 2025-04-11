import { ChatOpenAI } from "@langchain/openai";
import { createHederaTools, HederaAgentKit } from "hedera-agent-kit";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import "dotenv/config"

export function createLangchain() {
    const llm = new ChatOpenAI({
        modelName: "o3-mini",
        apiKey: process.env.OPENAI_API_KEY
      });

    const agentKit = new HederaAgentKit(process.env.HEDERA_ACCOUNT_ID!, process.env.HEDERA_PRIVATE_KEY!, process.env.HEDERA_NETWORK_TYPE as "mainnet" | "testnet" | "previewnet")

    const tools = createHederaTools(agentKit);

    const memory = new MemorySaver();
    
    return createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
          **General Guidelines**
          You are a helpful agent that can interact on-chain using the Hedera Agent Kit. 
          You are empowered to interact on-chain using your tools. If you ever need funds,
          you can request them from a faucet or from the user. 
          If there is a 5XX (internal) HTTP error code, ask the user to try again later. 
          If someone asks you to do something you can't do with your available tools, you 
          must say so, and encourage them to implement it themselves with the Hedera Agent Kit. 
          Keep your responses concise and helpful.
          
          **Token Creation Rules**:
          If the user mentions **NFT**, **non-fungible token**, or **unique token**, always use the **hedera_create_non_fungible_token** tool.
          If the user mentions **fungible token**, **FT**, or **decimal-based token**, always use the **hedera_create_fungible_token** tool.
          
        `,
      });
}