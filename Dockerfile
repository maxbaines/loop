# syntax=docker/dockerfile:1

# Base image with Bun runtime
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies only
FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Production image
FROM base AS release

# Copy dependencies from install stage
COPY --from=install /app/node_modules ./node_modules

# Copy source files
COPY src ./src
COPY package.json tsconfig.json ./

# Set default environment variables
ENV RALPH_WORKING_DIR=/workspace
ENV RALPH_PROGRESS_FILE=progress.txt
ENV RALPH_VERBOSE=false

# Create workspace directory
RUN mkdir -p /workspace

# Working directory for projects
VOLUME /workspace
WORKDIR /workspace

# Run the application
ENTRYPOINT ["bun", "run", "/app/src/index.ts"]
