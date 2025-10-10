#!/bin/bash

# Generate a simple beep alert sound using sox (if available)
# This script creates a 1-second beep at 800Hz

echo "🔊 Generating alert.mp3 audio file..."

# Check if sox is installed
if command -v sox &> /dev/null; then
    echo "✅ sox found, generating audio..."
    sox -n -r 44100 -c 2 public/alert.mp3 synth 0.5 sine 800 fade 0.1 0.5 0.1 vol 0.7
    echo "✅ alert.mp3 created successfully in public/ directory"
elif command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg found, generating audio..."
    # Generate a simple tone using ffmpeg
    ffmpeg -f lavfi -i "sine=frequency=800:duration=0.5" -ac 2 -ar 44100 -b:a 128k public/alert.mp3 -y
    echo "✅ alert.mp3 created successfully in public/ directory"
else
    echo "❌ Neither sox nor ffmpeg found."
    echo ""
    echo "📋 To generate the alert sound, you have several options:"
    echo ""
    echo "Option 1: Install sox and run this script"
    echo "  Ubuntu/Debian: sudo apt-get install sox"
    echo "  macOS: brew install sox"
    echo ""
    echo "Option 2: Install ffmpeg and run this script"
    echo "  Ubuntu/Debian: sudo apt-get install ffmpeg"
    echo "  macOS: brew install ffmpeg"
    echo ""
    echo "Option 3: Download a free alert sound"
    echo "  - https://freesound.org/"
    echo "  - https://mixkit.co/free-sound-effects/alert/"
    echo "  - https://www.zapsplat.com/"
    echo ""
    echo "Option 4: Use an online tone generator"
    echo "  - https://www.szynalski.com/tone-generator/"
    echo "  - Generate a 800Hz tone for 0.5-1 second"
    echo "  - Export as MP3 and save to public/alert.mp3"
    echo ""
    echo "The alert sound should be:"
    echo "  - Short (0.5-1 second)"
    echo "  - Clear and attention-grabbing"
    echo "  - Not too loud or jarring"
    echo "  - Saved as public/alert.mp3"
fi
