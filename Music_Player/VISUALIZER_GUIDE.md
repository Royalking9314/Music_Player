# Audio Visualizer & Synchronized Lyrics - Implementation Guide

## Overview
This implementation adds a stunning audio visualizer background with synchronized lyrics display to the music player, creating an immersive listening experience.

## Features Implemented

### 1. Audio Visualizer
- **Canvas-based visualization** using Web Audio API
- **Three visualization styles:**
  - **Bars**: Frequency bars that bounce with the music
  - **Circular**: Radial visualization around a center point
  - **Waveform**: Wave pattern showing audio amplitude
- **Dynamic gradient colors** that change with the music
- **Smooth 60fps animations** using requestAnimationFrame
- **Glow effects** for a modern aesthetic
- **Toggle on/off** button for the visualizer
- **Style selector** to switch between visualization modes

### 2. Synchronized Lyrics System
- **Line-by-line synchronization** with audio playback
- **LRC format support** for timestamped lyrics
- **Three-line display:**
  - Previous line (faded)
  - Current line (highlighted with glow effect)
  - Next line (faded preview)
- **Smooth transitions** between lines
- **Responsive design** that works on all screen sizes
- **Semi-transparent container** with backdrop blur effect

### 3. Backend Components

#### Models (`Buzz/models.py`)
- **Lyrics Model**: Stores synchronized lyrics with timestamps
  - `song`: OneToOneField to Song model
  - `lyrics_text`: Full lyrics text
  - `timestamps`: JSONField storing array of {time, text} objects
  - `parse_lrc_content()`: Method to parse LRC format files

#### API Endpoint (`/api/lyrics/<song_id>/`)
- Returns JSON with:
  - `success`: Boolean
  - `song_id`: Song ID
  - `song_title`: Song title
  - `timestamps`: Array of timestamped lyrics
  - `lyrics_text`: Full lyrics text (fallback)

#### Admin Interface
- **LyricsAdmin**: Manage synchronized lyrics
- **LyricsInline**: Add lyrics directly when editing songs
- Supports LRC format input

### 4. Frontend Components

#### HTML (`templates/main.html`)
- `<canvas id="visualizer-canvas">`: Full-screen visualizer background
- Visualizer controls (toggle button + style selector)
- Lyrics display container with three lines
- Audio element with `crossorigin="anonymous"` for Web Audio API

#### CSS (`static/style.css`)
- Visualizer canvas styling (full-screen, z-index: -1)
- Control buttons with hover effects
- Lyrics container with backdrop-filter blur
- Smooth transitions and animations
- Responsive media queries for mobile devices

#### JavaScript (`static/visualizer.js`)
- **AudioVisualizer class**:
  - Sets up Web Audio API (AudioContext, AnalyserNode)
  - Implements three visualization styles
  - Handles canvas rendering at 60fps
  - Manages color gradients and effects

- **LyricsManager class**:
  - Fetches lyrics from API
  - Synchronizes with audio playback
  - Updates display in real-time
  - Handles fallback for non-synchronized lyrics

## Usage

### Adding Synchronized Lyrics

#### Option 1: Django Admin
1. Log into Django admin at `/admin/`
2. Go to "Lyrics" section
3. Click "Add Lyrics"
4. Select a song
5. Enter lyrics in LRC format:
   ```
   [00:12.00]First line of lyrics
   [00:15.50]Second line of lyrics
   [00:20.00]Third line of lyrics
   ```
6. Save

#### Option 2: Python Shell
```python
from Buzz.models import Song, Lyrics

song = Song.objects.get(id=1)
lyrics = Lyrics.objects.create(song=song)

lrc_content = """
[00:12.00]First line
[00:15.50]Second line
[00:20.00]Third line
"""

lyrics.parse_lrc_content(lrc_content)
lyrics.save()
```

### Using the Visualizer

1. **Load a song**: Navigate to the music player page
2. **Play audio**: Click the play button
3. **Toggle visualizer**: Click the eye icon to turn visualizer on/off
4. **Change style**: Use the dropdown to select between:
   - Bars
   - Circular
   - Waveform

### LRC Format Reference

LRC (Lyric) format uses timestamps in `[MM:SS.xx]` format:
- `MM`: Minutes (00-99)
- `SS`: Seconds (00-59)
- `xx`: Hundredths of seconds (00-99)

Example:
```
[00:12.00]Line appears at 12 seconds
[00:17.50]Line appears at 17.5 seconds
[01:23.00]Line appears at 1 minute 23 seconds
```

## Technical Details

### Web Audio API Integration
- **AudioContext**: Creates audio processing context
- **AnalyserNode**: Provides frequency/time domain data
- **MediaElementSource**: Connects audio element to analyser
- **FFT Size**: 256 (provides 128 frequency bins)

### Performance Optimization
- **requestAnimationFrame**: Ensures smooth 60fps animations
- **Canvas optimization**: Uses efficient drawing methods
- **Conditional rendering**: Only animates when audio is playing
- **Backdrop-filter**: Hardware-accelerated blur effects

### Browser Compatibility
- Modern browsers with Web Audio API support
- Falls back gracefully if features unavailable
- Responsive design for mobile and desktop

## File Structure

```
Music_Player/
├── Buzz/
│   ├── models.py              # Lyrics model with LRC parsing
│   ├── views.py               # API endpoint for lyrics
│   ├── urls.py                # URL routing
│   ├── admin.py               # Admin interface
│   ├── tests.py               # Unit tests
│   ├── static/
│   │   ├── style.css          # Visualizer and lyrics styling
│   │   ├── visualizer.js      # Visualizer and lyrics JavaScript
│   │   └── script.js          # Original player script
│   └── templates/
│       ├── index.html         # Main template
│       └── main.html          # Player and visualizer markup
└── migrations/
    └── 0005_lyrics.py         # Database migration for Lyrics model
```

## Testing

Run tests with:
```bash
python manage.py test Buzz
```

Tests cover:
- Lyrics model creation
- LRC format parsing
- API endpoint responses
- Error handling

## Future Enhancements

Potential improvements:
- Upload LRC files directly through admin
- Auto-fetch lyrics from external APIs
- More visualization styles (spectrum, particle effects)
- Lyrics editing interface in player
- Karaoke mode with larger display
- Lyrics search and filtering
- Export lyrics to various formats

## Troubleshooting

### Visualizer not showing
- Check browser console for errors
- Ensure audio element has `crossorigin="anonymous"` attribute
- Verify Web Audio API is supported

### Lyrics not syncing
- Verify Lyrics object exists for the song
- Check timestamps are in correct format (seconds, not MM:SS)
- Ensure API endpoint returns valid data

### Performance issues
- Reduce FFT size for lower-end devices
- Disable visualizer glow effects
- Use simpler visualization style (waveform)

## Credits

Implementation follows modern web standards and best practices for audio visualization and synchronized content display.
