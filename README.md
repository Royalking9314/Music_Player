# Buzz Music Player

Buzz Music Player is a Django-based music player web app with a custom front end for browsing songs, playing audio, viewing album art, reading lyrics, and switching between multiple audio visualizations.

## Features

- Song library powered by a Django `Song` model
- Album art, artist name, title, and lyrics display
- Audio playback with play/pause, seek, volume, shuffle, and repeat controls
- Three visualizer modes: bars, waveform, and circular
- Keyboard shortcuts for playback and navigation
- Pagination-based navigation between songs
- Django admin support for managing songs
- Static and media file handling for images and audio uploads

## Tech Stack

- Python 3
- Django 5.2
- SQLite (default local database)
- HTML, CSS, and vanilla JavaScript
- Web Audio API for the visualizer

## Project Structure

- `manage.py` - Django command-line entry point
- `settings.py` - Project settings, static files, and media configuration
- `urls.py` - Root URL routing
- `Buzz/` - Main app containing the music player logic
- `Buzz/models.py` - `Song` model definition
- `Buzz/views.py` - Index view that paginates songs
- `Buzz/templates/` - Django templates for the player UI
- `Buzz/static/` - Styles and JavaScript for the player and visualizer
- `media/` - Uploaded song and image files

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Apply migrations:

```bash
python manage.py migrate
```

4. Create an admin user if you want to manage songs through Django admin:

```bash
python manage.py createsuperuser
```

5. Start the development server:

```bash
python manage.py runserver
```

Then open the site at `http://127.0.0.1:8000/`.

## Managing Songs

Songs are displayed one at a time through pagination. Each `Song` can include:

- `title`
- `artist`
- `image`
- `lyrics`
- `duration`
- `audio_file` or `audio_link`

You can add and edit songs from the Django admin after registering a superuser.

## Media And Static Files

- Uploaded images and audio files are stored in `media/`
- App assets are served from `Buzz/static/`
- The player UI uses `player.js`, `visualizer.js`, and `modern-ui.css`

## Notes

- The default database is `db.sqlite3`.
- The app is configured for local development with `DEBUG = True`.
- If you add new songs, make sure the corresponding image and audio files are available in the media directory or via a valid audio URL.