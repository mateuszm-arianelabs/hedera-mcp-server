import {Tool} from "fastmcp";
import {z} from "zod";
import {Logger} from "@mcp/logger";

export async function handleHederaInteraction(fullPrompt: string, apiUrl: string | undefined, sessionId?: string) {
    Logger.debug(`Handling Hedera interaction with prompt: ${fullPrompt}`);
    if (!apiUrl) {
        Logger.error("API_URL environment variable is not set.");
        return "API_URL environment variable is not set."
    }

    Logger.log(`Forwarding request to Langchain proxy: ${apiUrl}`);
    try {
        const token = process.env.LANGCHAIN_PROXY_TOKEN;
        const isCustodial = process.env.CUSTODIAL_MODE;

        const response = await fetch(apiUrl, {
            method: "POST",
            body: JSON.stringify({
                fullPrompt,
                sessionId
            }),
            headers: {
                "Content-Type": "application/json",
                "X-LANGCHAIN-PROXY-TOKEN": token || "",
                "X-CUSTODIAL-MODE": isCustodial || "false"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            Logger.error(`API request failed with status ${response.status}: ${errorText}`);
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        Logger.debug("Received response from Langchain proxy:", data);

        if(data.success) {
            return JSON.stringify(data.data);
        } else {
            throw new Error(data.error);
        }
    } catch (e) {
        Logger.error("Error during Hedera interaction handling:", e);
        let errorString: string;
        if (e instanceof Error) {
            errorString = e.toString();
        } else {
            errorString = String(e);
        }
        return `An error occurred while interacting with Hedera: ${errorString}`
    }
}