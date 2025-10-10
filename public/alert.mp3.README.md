# Alert Sound Placeholder

This file should be replaced with an actual `alert.mp3` audio file.

## How to add the alert sound:

1. **Download a free alert sound:**
   - https://freesound.org/
   - https://mixkit.co/free-sound-effects/alert/
   - https://www.zapsplat.com/

2. **Generate your own:**
   - Use an online tone generator: https://www.szynalski.com/tone-generator/
   - Generate a 800Hz tone for 0.5-1 second
   - Export as MP3

3. **Use the provided script:**
   ```bash
   # Install sox or ffmpeg first
   sudo apt-get install sox
   # or
   sudo apt-get install ffmpeg
   
   # Then run the script
   bash scripts/generate-alert-sound.sh
   ```

4. **Recommended specifications:**
   - Format: MP3
   - Duration: 0.5-1 second
   - Frequency: 800Hz (or similar attention-grabbing tone)
   - Volume: Moderate (not too loud)

Save the MP3 file as `public/alert.mp3` and the Admin Wall will use it for failure notifications.

**Note:** The Admin Wall will work without this file, but sound alerts won't play.
