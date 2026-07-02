<div align="center">
  <h1>🎵 Buzz Music Player</h1>
  <p>
	 <b>A Django-based music player with a modern audio interface, lyrics display, and live visualizer modes.</b>
  </p>

  <p>
	 <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
	 <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
	 <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
	 <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  </p>
</div>

---

## 📖 Overview

**Buzz Music Player** is a single-app Django project that renders a polished music player UI backed by a `Song` model. The app presents one track at a time with pagination, shows album art and lyrics, and uses a custom JavaScript player to handle playback controls, keyboard shortcuts, volume management, and audio visualizations.

The experience is built around a dark, glassmorphism-style interface and a Web Audio API visualizer with three display modes: bars, waveform, and circular.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎧 **Audio Playback** | Play, pause, seek, mute, adjust volume, and repeat the current song. |
| 🖼️ **Track Details** | Display title, artist, album art, and optional lyrics for each song. |
| 📚 **Song Pagination** | Browse tracks one at a time using previous/next navigation. |
| 🌈 **Live Visualizer** | Render audio as bars, waveform, or circular visualization. |
| ⌨️ **Keyboard Shortcuts** | Control playback with Space, arrow keys, `M`, `F`, and number keys. |
| 🛠️ **Admin Management** | Add and manage songs through Django admin. |
| 📁 **Media Support** | Store uploaded images and audio files under `media/`. |

---

## 🏗️ Architecture

Buzz Music Player uses a simple Django architecture with a single app and a custom front end.

### 🎨 Frontend

The UI is rendered with Django templates and enhanced by vanilla JavaScript:
- `Buzz/templates/index.html` loads the app shell and visualizer scripts.
- `Buzz/templates/main.html` renders the player, lyrics section, and floating controls.
- `Buzz/static/modern-ui.css` provides the visual design and responsive layout.
- `Buzz/static/player.js` manages playback, keyboard shortcuts, volume, and UI state.
- `Buzz/static/visualizer.js` draws audio visualizations using the Web Audio API.

### ⚙️ Backend

The backend is a standard Django project:
- `Song` is the core model and contains title, artist, image, lyrics, duration, audio file, and audio link fields.
- `Buzz.views.index` paginates `Song` objects and sends the current track to the template.
- `Buzz.admin` registers the `Song` model for admin management.
- SQLite is used as the default database through `db.sqlite3`.

---

## 🚀 Getting Started

### Prerequisites

- Python 3
- `pip`
- A browser that supports the Web Audio API

### Installation

1. Clone the repository:
	```bash
	git clone https://github.com/DevRexxxx/Music_Player.git
	cd Music_Player
	```

2. Install dependencies:
	```bash
	pip install -r requirements.txt
	```

3. Run migrations:
	```bash
	python manage.py migrate
	```

4. Create a superuser if you want to manage songs from the admin panel:
	```bash
	python manage.py createsuperuser
	```

---

## 🖥️ Running the Application

1. Start the development server:
	```bash
	python manage.py runserver
	```

2. Open the app in your browser:
	```text
	http://127.0.0.1:8000/
	```

3. Optional: open the Django admin panel:
	```text
	http://127.0.0.1:8000/admin/
	```

---

## 🎵 Managing Songs

Each song is stored as a `Song` record and can include:

- `title`
- `artist`
- `image`
- `lyrics`
- `duration`
- `audio_file`
- `audio_link`

The current UI shows one song per page, so navigation buttons move through the song collection using Django pagination.

---

## 📁 Project Structure

- `manage.py` - Django command entry point
- `settings.py` - Project settings, static files, and media configuration
- `urls.py` - Root URL routing
- `Buzz/` - Main application package
- `Buzz/models.py` - `Song` model definition
- `Buzz/views.py` - Index view and pagination logic
- `Buzz/urls.py` - App URL routes
- `Buzz/templates/` - Player templates
- `Buzz/static/` - Styles and JavaScript assets
- `media/` - Uploaded audio and image files

---

## 🔧 Notes

- The default database is SQLite (`db.sqlite3`).
- Static files are served from `Buzz/static/`.
- Media files are served from `media/`.
- The project is configured for local development with `DEBUG = True`.
- If a song has no uploaded audio file, the template falls back to the `audio_link` field.

---

<div align="center">
  <br />
  <p><i>Built for a smooth listening experience.</i></p>
</div>