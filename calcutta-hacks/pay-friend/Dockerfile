FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package files and the CLI package
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Expose port (adjust if needed)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "src/index.ts"]