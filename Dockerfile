# Stage 1: Builder — installs deps and compiles TypeScript
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace manifests first (for layer caching)
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./

# Copy all package.json files so pnpm can install the full workspace
COPY packages/types/package.json ./packages/types/package.json
COPY packages/validation/package.json ./packages/validation/package.json
COPY packages/config/ ./packages/config/
COPY apps/api/package.json ./apps/api/package.json

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build shared packages first, then the API
RUN pnpm --filter @gym-saas/types build
RUN pnpm --filter @gym-saas/validation build
RUN pnpm --filter @gym-saas/api build

# ---

# Stage 2: Runner — lean production image
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy manifests
COPY packages/types/package.json ./packages/types/package.json
COPY packages/validation/package.json ./packages/validation/package.json
COPY packages/config/ ./packages/config/
COPY apps/api/package.json ./apps/api/package.json

# Install production-only deps
RUN pnpm install --frozen-lockfile --prod

# Copy compiled artifacts from builder
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/validation/dist ./packages/validation/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

ENV NODE_ENV=production

WORKDIR /app/apps/api
EXPOSE 5001
CMD ["node", "dist/server.js"]
