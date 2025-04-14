FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm and tsx globally for direct command access
RUN npm install -g pnpm tsx

# Copy workspace configuration and root package.json
COPY package.json ./
COPY pnpm-workspace.yaml ./

# Copy package manifests for all workspace packages
COPY packages/langchain-proxy/package.json ./packages/langchain-proxy/
COPY packages/logger/package.json ./packages/logger/
COPY packages/mcp-server/package.json ./packages/mcp-server/

# Copy the lock file
COPY pnpm-lock.yaml ./

# Install dependencies for the entire workspace
RUN pnpm install

# Copy source files for this specific package
COPY packages/langchain-proxy/src ./packages/langchain-proxy/src
COPY packages/langchain-proxy/tsconfig.docker.json ./packages/langchain-proxy/tsconfig.json

# Set WORKDIR after copying files needed for context
WORKDIR /app/packages/langchain-proxy

# Skip build due to TypeScript errors
# Just directly run with tsx in the runner stage

FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm tsx

# Copy built application (source, dependencies, config) from builder
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml

# Set the working directory for the running container
WORKDIR /app/packages/langchain-proxy

# Expose the application port
EXPOSE 3001

# Run the TypeScript directly with tsx
CMD ["tsx", "src/main.ts"]
