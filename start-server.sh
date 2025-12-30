#!/bin/bash

echo "Starting Lawn Mower Demo Game Server..."

# Change to script directory
cd "$(dirname "$0")"

# Kill process using port 8080
echo "Checking port 8080..."
PID=$(lsof -t -i:8080 2>/dev/null)
if [ -n "$PID" ]; then
    echo "Killing process $PID occupying port 8080..."
    kill -9 $PID 2>/dev/null
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found. Installing..."
    npm install -g pnpm
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Build shared package
echo "Building shared package..."
pnpm --filter @example/lawn-mower-shared build

# Build and start server
echo "Building and starting server..."
pnpm --filter @example/lawn-mower-server build
pnpm --filter @example/lawn-mower-server start
