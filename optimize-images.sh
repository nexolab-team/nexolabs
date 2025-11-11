#!/bin/bash

# Image Optimization Script for NexoLabs Website
# This script optimizes images to ensure fast loading times
# Can run in watch mode to auto-optimize new images

echo "🖼️  NexoLabs Image Optimizer"
echo "================================"

# Check if imagemagick and webp tools are installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick not found. Installing..."
    sudo apt-get update && sudo apt-get install -y imagemagick
fi

if ! command -v cwebp &> /dev/null; then
    echo "⚠️  WebP tools not found. Installing..."
    sudo apt-get install -y webp
fi

# Check for inotify-tools for watch mode
if ! command -v inotifywait &> /dev/null && [[ "$1" == "watch" ]]; then
    echo "⚠️  inotify-tools not found. Installing for watch mode..."
    sudo apt-get install -y inotify-tools
fi

# Function to optimize images
optimize_images() {
    local dir=$1
    local max_width=1920
    local quality=85
    
    echo ""
    echo "📁 Processing directory: $dir"
    
    # Process PNG and JPG files
    shopt -s nullglob
    for ext in png jpg jpeg PNG JPG JPEG; do
        for img in "$dir"/*.$ext; do
            [ -e "$img" ] || continue
        
        filename=$(basename "$img")
        echo "  ⚙️  Optimizing: $filename"
        
        # Resize if too large and compress
        convert "$img" -resize "${max_width}x${max_width}>" -quality $quality -strip "$img"
        
        # Convert to WebP for better compression
        webp_name="${img%.*}.webp"
        cwebp -q $quality "$img" -o "$webp_name" 2>/dev/null
        
        echo "  ✅ Optimized: $filename"
        done
    done
    
    # Optimize existing WebP files
    for img in "$dir"/*.webp; do
        [ -e "$img" ] || continue
        
        filename=$(basename "$img")
        echo "  ⚙️  Re-optimizing WebP: $filename"
        
        # Re-compress with optimal settings
        cwebp -q $quality "$img" -o "${img}.tmp" 2>/dev/null
        mv "${img}.tmp" "$img" 2>/dev/null
        
        echo "  ✅ Re-optimized: $filename"
    done
}

# Function to run optimization once
optimize_all() {
    echo ""
    echo "🚀 Starting optimization..."
    
    optimize_images "public/assets/avatars"
    optimize_images "public/assets/certs"
    optimize_images "public/images/writeups"
    
    echo ""
    echo "✨ Optimization complete!"
    echo ""
    echo "📊 Directory sizes:"
    du -sh public/assets/* public/images/* 2>/dev/null | sort -h
    
    echo ""
    echo "💡 Tips:"
    echo "  - Use WebP format for best compression"
    echo "  - Keep images under 200KB when possible"
    echo "  - Recommended max dimensions: 1920x1920px"
    echo ""
}

# Function for watch mode
watch_mode() {
    echo ""
    echo "👁️  Watch mode activated!"
    echo "Monitoring for new images in:"
    echo "  - public/assets/avatars"
    echo "  - public/assets/certs"
    echo "  - public/images/writeups"
    echo ""
    echo "Press Ctrl+C to stop..."
    echo ""
    
    # Initial optimization
    optimize_all
    
    # Watch for new files
    inotifywait -m -r -e create -e moved_to \
        --include '\.(jpg|jpeg|png|webp|JPG|JPEG|PNG|WEBP)$' \
        public/assets/avatars public/assets/certs public/images/writeups 2>/dev/null |
    while read -r directory event filename; do
        echo "🔍 Detected: $filename in $directory"
        
        # Wait a bit for file to be fully written
        sleep 1
        
        # Optimize the specific directory
        if [[ "$directory" == *"avatars"* ]]; then
            optimize_images "public/assets/avatars"
        elif [[ "$directory" == *"certs"* ]]; then
            optimize_images "public/assets/certs"
        elif [[ "$directory" == *"writeups"* ]]; then
            optimize_images "public/images/writeups"
        fi
    done
}

# Check command line argument
if [[ "$1" == "watch" || "$1" == "-w" ]]; then
    watch_mode
else
    optimize_all
fi
