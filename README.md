# Hedera MCP Server

This project provides a server that integrates with a Langchain wrapper to interact with the Hedera network. It allows users to perform Hedera operations through natural language commands facilitated by the Langchain setup.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later recommended)
- pnpm (`npm install -g pnpm`)
- Git

Additionally, you must have the [Hedera Langchain Wrapper](https://github.com/mateuszm-arianelabs/hedera-langchain-wrapper) service installed and running in the background. This server relies on the wrapper to communicate with the Hedera network.

## Quickstart

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/mateuszm-arianelabs/hedera-mcp-server.git
    cd hedera-mcp-server
    ```

2.  **Set up environment variables:**
    - Copy the example environment file:
      ```sh
      cp .env.example .env
      ```
    - Edit the `.env` file and fill in the required configuration values (e.g., API keys, network details).

3.  **Install dependencies:**
    ```sh
    pnpm install
    ```

4.  **Ensure the [Hedera Langchain Wrapper](https://github.com/mateuszm-arianelabs/hedera-langchain-wrapper) service is running.**

5.  **Run the server:**
    ```sh
    pnpm run dev
    ```
    (Or `pnpm start` for production mode, if configured).

## Available Tools

-   **Interact with Hedera:** This core functionality enables the server to make calls to the running Langchain wrapper service. The wrapper then interprets these requests and performs the corresponding actions on the Hedera network (e.g., creating tokens, transferring HBAR, interacting with smart contracts).

## Simplified Architecture

![Architecture Diagram](./docs/architecture.png)

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.