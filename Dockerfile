FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@9.10.0 --activate

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm --filter=./packages/mcp-server deploy --prod /prod/mcp-server
RUN pnpm --filter=./packages/langchain-proxy deploy --prod /prod/langchain-proxy

FROM base AS mcp-server
COPY --from=build /prod/mcp-server /prod/mcp-server
WORKDIR /prod/mcp-server
EXPOSE 8000
CMD ["node", "build/main.js"]

FROM base AS langchain-proxy
COPY --from=build /prod/langchain-proxy /prod/langchain-proxy
WORKDIR /prod/langchain-proxy
EXPOSE 8001
CMD ["node", "build/main.js"]