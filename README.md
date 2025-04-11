# Hedera MCP Server

This project provides a server that integrates with a Langchain wrapper to interact with the Hedera network. It allows users to perform Hedera operations through natural language commands facilitated by the Langchain setup.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (20 or later recommended)
- pnpm (`npm install -g pnpm`)
- Git

## Quickstart
The whole thing consists of two services that we need to run.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/mateuszm-arianelabs/hedera-mcp-server.git
    cd hedera-mcp-server
    ```

2.  **Set up environment variables in packages:**
    - You need to copy the .env.example file and create .env from it in two locations:
        - packages/langchain-proxy
        - packages/mcp-server

    - Edit the `.env` file and fill in the required configuration values (e.g., Hedera keys, network details).

3.  **Install dependencies:**
    ```sh
    pnpm install
    ```

4.  **Start Lang chain Proxy Service**
    ```
    pnpm run dev:lc
    ```
    (Or `pnpm start` for production mode, if configured).
5.  **Run the mcp server:**
    ```sh
    pnpm run dev:mcp
    ```
    (Or `pnpm start` for production mode, if configured).

## Available Tools

-   **Interact with Hedera:** This core functionality enables the server to make calls to the running Langchain wrapper service. The wrapper then interprets these requests and performs the corresponding actions on the Hedera network (e.g., creating tokens, transferring HBAR, interacting with smart contracts).

## Simplified Architecture

![Architecture Diagram](./docs/architecture.png) 

## API Documentation (langchain-proxy)

### POST /interact-with-hedera

Interact with Hedera blockchain using natural language prompts.

#### Request

```
POST /interact-with-hedera
Content-Type: application/json

{
  "fullPrompt": "Create a new NFT collection called My Awesome Collection"
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| fullPrompt | string | Natural language instruction for Hedera operations |

#### Response

```json
{
  "content": [
    {
      "type": "object",
      "content": {
        // Response content from Hedera operations
      }
    }
  ]
}
```

In case of an error:

```json
{
  "content": [
    {
      "type": "text",
      "content": "An error occurred while interacting with Hedera: [error message]"
    }
  ]
}
```