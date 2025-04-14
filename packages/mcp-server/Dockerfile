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
COPY packages/mcp-server/src ./packages/mcp-server/src
COPY packages/mcp-server/tsconfig.docker.json ./packages/mcp-server/tsconfig.json

# Set WORKDIR after copying files needed for context
WORKDIR /app/packages/mcp-server


FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm tsx

# Copy build output and node_modules from the builder stage
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml

# Set the working directory for the running container
WORKDIR /app/packages/mcp-server

EXPOSE 3000
CMD ["tsx", "src/main.ts"]
