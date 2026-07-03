<div align="center">
  <h1>🎵 Buzz Music Player</h1>
  <p>
	 <b>A Django-based music player with a modern audio interface, lyrics display, live visualizer modes, and a REST API backend.</b>
  </p>

  <p>
     <img src="https://img.shields.io/badge/Version-3.0-blue?style=for-the-badge" alt="Version 3.0" />
	 <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
	 <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
	 <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
	 <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  </p>
</div>

---

## 📖 Overview

**Buzz Music Player** is a Django project that renders a highly polished music player UI backed by a robust REST API. The app presents a dynamic library with real-time search, album art, synced lyrics, and uses a custom JavaScript player to handle playback controls, keyboard shortcuts, volume management, and live audio visualizations.

The experience is built around a modern, glassmorphism-style interface featuring a light/dark theme toggle, a persistent library sidebar, and a Web Audio API visualizer with multiple display modes.

---

## 🚀 Version History

### Version 3.0 (Current)
*Major architectural overhaul transforming the player into a full-featured application experience with a REST API backend.*
- **New Data Models:** Introduced `Genre`, `Album`, and `Favorite` models to support a richer music library structure with strict file validators.
- **REST API Integration:** Implemented Django REST Framework to expose JSON endpoints (`/api/songs/`, `/api/genres/`, etc.) for dynamic data access.
- **Dynamic Sidebar UI:** Built a persistent sidebar injected with JSON state for seamless, instant client-side song searching and genre filtering without page reloads.
- **Authentication & Favorites:** Added user registration, login, and personalized "Heart/Favorite" toggling for tracks.
- **UI/UX Overhaul:** Complete redesign using modern glassmorphism, fully responsive mobile layouts, and a light/dark theme toggle system.
- **Enhanced Player:** Added "Auto-play next track" functionality and a sticky floating player for mobile/desktop.
- **CLI Utilities:** Added a `fetch_lyrics` management command utilizing `syncedlyrics` to scrape and parse LRC lyrics automatically.

### Version 2.0
*Introduced rich media features and interactive playback controls.*
- **Live Visualizer:** Integrated Web Audio API to render real-time audio visualizations (Bars, Waveform, Circular).
- **Synced Lyrics:** Added support for time-stamped JSON lyrics that automatically highlight and scroll as the song progresses.
- **Keyboard Shortcuts:** Added comprehensive keyboard controls (Space, arrow keys, M, F, and number keys) for playback manipulation.
- **Polished Aesthetics:** Transitioned to a sleek dark aesthetic with a centralized now-playing card.

### Version 1.0
*The initial foundation of the Buzz Music Player.*
- **Core Playback:** Basic HTML5 audio playback and custom UI controls (play, pause, seek, volume).
- **Basic Models:** A simple `Song` model containing title, artist, cover image, and audio files.
- **Pagination:** Simple server-side rendering and pagination to browse one track at a time.
- **Admin Management:** Basic Django admin integration for uploading songs and media files.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎧 **Audio Playback** | Play, pause, seek, mute, adjust volume, and auto-play next tracks. |
| 🗂️ **Library Management** | Browse by Genres, Albums, and real-time Search. |
| 🖼️ **Track Details** | Display title, artist, album art, and interactive synced lyrics. |
| 🌈 **Live Visualizer** | Render audio as bars, waveform, or circular visualizations. |
| 🔐 **User Accounts** | Register, login, and save favorite songs. |
| 🌓 **Theming** | Seamlessly toggle between Light and Dark modes. |
| ⌨️ **Keyboard Shortcuts** | Control playback with Space, arrow keys, `M`, `F`, and number keys. |

---

## 🏗️ Architecture

Buzz Music Player uses a decoupled approach where Django serves the initial UI shell and provides a REST API, while Vanilla JS manages the client state.

### 🎨 Frontend

The UI is rendered with Django templates and enhanced by modern JavaScript:
- `Buzz/templates/index.html` loads the app shell, sidebar, and layout structures.
- `Buzz/templates/main.html` renders the central player, lyrics section, and floating controls.
- `Buzz/static/modern-ui.css` provides the responsive glassmorphism design system.
- `Buzz/static/player.js` manages playback, queue, search, filtering, theme toggling, and API interactions.
- `Buzz/static/visualizer.js` draws audio visualizations using the Web Audio API.

### ⚙️ Backend

The backend is built with Django and Django REST Framework:
- `models.py` defines `Song`, `Genre`, `Album`, and `Favorite` entities.
- `api_views.py` & `serializers.py` provide RESTful JSON endpoints.
- `views.py` handles authentication and the primary application view.
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
	python manage.py makemigrations
	python manage.py migrate
	```

4. Create a superuser to manage songs from the admin panel:
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

---

## 📁 Project Structure

- `manage.py` - Django command entry point
- `settings.py` - Project settings, REST framework, and decouple configurations
- `requirements.txt` - Python dependencies
- `Buzz/` - Main application package
  - `models.py` - Core database schemas
  - `api_views.py` - REST API logic
  - `views.py` - Standard view controllers
  - `management/commands/fetch_lyrics.py` - CLI lyric fetcher
  - `templates/` - HTML UI views
  - `static/` - Styles and JavaScript assets

---

<div align="center">
  <br />
  <p><i>Built for a smooth listening experience.</i></p>
</div>