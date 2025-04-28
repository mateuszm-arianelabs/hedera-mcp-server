import { ChatOpenAI } from "@langchain/openai";
import { createHederaTools, HederaAgentKit } from "hedera-agent-kit";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import "dotenv/config"
import { Logger } from "@mcp/logger";

export function createLangchain() {
    Logger.log("Creating Langchain agent...");

    const llmApiKey = process.env.OPENAI_API_KEY;
    const hederaAccountId = process.env.HEDERA_ACCOUNT_ID;
    const hederaPrivateKey = process.env.HEDERA_PRIVATE_KEY;
    const hederaPublicKey = process.env.HEDERA_PUBLIC_KEY;
    const hederaNetworkType = process.env.HEDERA_NETWORK_TYPE as "mainnet" | "testnet" | "previewnet";

    if (!llmApiKey) Logger.warn("OPENAI_API_KEY environment variable not set.");
    if (!hederaAccountId) Logger.warn("HEDERA_ACCOUNT_ID environment variable not set.");
    if (!hederaPrivateKey) Logger.warn("HEDERA_PRIVATE_KEY environment variable not set.");
    if (!hederaPublicKey) Logger.warn("HEDERA_PUBLIC_KEY environment variable not set.");
    if (!hederaNetworkType) Logger.warn("HEDERA_NETWORK_TYPE environment variable not set.");

    const llm = new ChatOpenAI({
        modelName: "o3-mini",
        apiKey: llmApiKey
      });
    Logger.debug("ChatOpenAI initialized.");

    const agentKit = new HederaAgentKit(
      hederaAccountId as string,
      undefined,
      hederaNetworkType
    )
    Logger.debug("HederaAgentKit initialized.");

    const tools = createHederaTools(agentKit);
    Logger.debug("Hedera tools created:", tools.map(t => t.name));

    const memory = new MemorySaver();
    Logger.debug("MemorySaver initialized.");

    const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
          **General Guidelines**
          You are a helpful agent that can interact on-chain using the Hedera Agent Kit. 
          You are empowered to interact on-chain using your tools. If you ever need funds,
          you can request them from a faucet or from the user. 
          If there is a 5XX (internal) HTTP error code, ask the user to try again later. 
          If someone asks you to do something you can\'t do with your available tools, you 
          must say so, and encourage them to implement it themselves with the Hedera Agent Kit. 
          Keep your responses concise and helpful.

          **Token Creation Rules**:
          If the user mentions **NFT**, **non-fungible token**, or **unique token**, always use the **hedera_create_non_fungible_token** tool.
          If the user mentions **fungible token**, **FT**, or **decimal-based token**, always use the **hedera_create_fungible_token** tool.

        `,
      });
    Logger.log("React agent created successfully.");
    return agent;
}