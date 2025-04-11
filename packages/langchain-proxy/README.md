# Hedera Langchain Wrapper

A service that wraps LangChain to provide interaction with the Hedera blockchain through natural language prompts. This wrapper integrates Hedera Agent Kit with LangChain to enable on-chain operations via an API.

## Features

- Natural language interface to Hedera blockchain operations
- Token creation (both fungible and non-fungible tokens)
- Integration with OpenAI's language models
- Express API server

## Quick start

1. Clone repository
```sh
git clone https://github.com/mateuszm-arianelabs/hedera-langchain-wrapper
```
2. Install dependencies
```sh
pnpm install
```
3. Create `.env` file based on `.env.example`
```sh
# Required environment variables
HEDERA_ACCOUNT_ID=      # Your Hedera account ID
HEDERA_PRIVATE_KEY=     # Your Hedera private key
HEDERA_NETWORK_TYPE=    # 'mainnet', 'testnet', or 'previewnet'
HEDERA_KEY_TYPE=        # Your Hedera key type
OPENAI_API_KEY=         # Your OpenAI API key
```
4. Start the development server
```sh
pnpm run dev
```
5. Works best with [Hedera MCP Server](https://github.com/mateuszm-arianelabs/hedera-mcp-server)

## API Documentation

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