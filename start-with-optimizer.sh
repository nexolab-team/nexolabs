#!/bin/bash

# Start NexoLabs with auto image optimization
# This runs the dev server and watches for new images simultaneously

echo "🚀 Starting NexoLabs Development Environment"
echo "=============================================="
echo ""

# Kill any existing processes
pkill -f "npm run dev" 2>/dev/null
pkill -f "optimize-images.sh" 2>/dev/null

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    pkill -P $$ 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start image optimizer in watch mode
echo "📸 Starting image optimizer in watch mode..."
./optimize-images.sh watch &
OPTIMIZER_PID=$!

# Give optimizer a moment to start
sleep 2

# Start Astro dev server
echo ""
echo "🌐 Starting Astro dev server..."
npm run dev &
DEV_PID=$!

echo ""
echo "✨ Environment ready!"
echo ""
echo "  🌐 Dev Server: http://localhost:4321"
echo "  👁️  Auto-Optimizer: Running"
echo ""
echo "Just add images to the folders and they'll be auto-optimized!"
echo "Press Ctrl+C to stop both services."
echo ""

# Wait for both processes
wait
