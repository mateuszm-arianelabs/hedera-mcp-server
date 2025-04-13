FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm and tsx globally for direct command access
RUN npm install -g pnpm tsx

# Copy only this package and shared context
COPY packages/mcp-server/package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

# Copy source files
COPY packages/mcp-server/src ./src
COPY packages/mcp-server/tsconfig.docker.json ./tsconfig.json

# Run the build using the copied tsconfig.json
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm tsx

# Copy build output and node_modules from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY packages/mcp-server/package.json ./

EXPOSE 3000
CMD ["tsx", "build/main.js"]
