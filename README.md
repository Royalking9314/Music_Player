<p align="center">
  <img src="https://img.icons8.com/color/128/000000/music-record.png" alt="Buzz Music Player Logo" width="128" height="128" />
</p>

<h1 align="center">Buzz Music Player</h1>

<p align="center">
  <strong>A premium Django-based music player with a modern glassmorphism interface, interactive lyrics, and live audio visualizations.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-4.0.0-blueviolet?style=flat-square" alt="Version 4.0.0" />
  <img src="https://img.shields.io/badge/django-5-092E20?style=flat-square&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/python-3-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/javascript-ES6-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/postgresql-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

---

## ✨ Overview

**Buzz Music Player** is a highly polished, single-page application experience built on Django. It transforms a standard web browser into a full-featured music environment, complete with a REST API backend, dynamic client-side filtering, and a stunning glassmorphism design system. 

Whether you're organizing your library by genres, hunting down lyrics, or just relaxing with the live audio visualizer, Buzz offers a seamless and immersive listening experience.

---

## 🏗️ Architecture

Buzz Music Player uses a decoupled approach where Django serves the initial UI shell and provides a REST API, while Vanilla JS manages the client state.

```text
┌──────────────────────────────────────────────┐
│                Frontend (Vanilla JS)         │
│  ┌─────┐ ┌──────┐ ┌─────┐ ┌──────┐ ┌──────┐  │
│  │UI   │ │Player│ │Queue│ │Search│ │Visual│  │
│  └─────┘ └──────┘ └─────┘ └──────┘ └──────┘  │
└──────────────────┬───────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼───────────────────────────┐
│            Backend (Django REST)             │
│  • api_views.py  • serializers.py            │
│  • views.py      • urls.py                   │
└──────────────────┬───────────────────────────┘
                   │ ORM / Models
┌──────────────────▼───────────────────────────┐
│           Database (PostgreSQL)              │
│  • Song • Genre • Album • Favorite           │
└──────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | HTML5 + Vanilla JavaScript (ES6) |
| **Styling** | Custom CSS (Glassmorphism, CSS Variables) |
| **Backend Framework**| Django + Django REST Framework |
| **Database** | PostgreSQL (Supabase) |
| **Media API** | Web Audio API |
| **Typography** | Inter (Google Fonts) |

---

## 📁 Project Structure

```text
Music_Player/
├── manage.py                        # Django command entry point
├── requirements.txt                 # Python dependencies
├── .env                             # Environment variables
├── settings.py                      # Project settings & REST config
├── urls.py                          # Project URL routing
├── wsgi.py                          # WSGI config for deployment
├── asgi.py                          # ASGI config for async deployment
├── Buzz/
│   ├── models.py                    # DB schemas: Song, Genre, Album, Favorite
│   ├── api_views.py                 # RESTful JSON endpoints
│   ├── views.py                     # Standard view controllers & auth
│   ├── serializers.py               # Django REST serializers
│   ├── management/
│   │   └── commands/
│   │       └── fetch_lyrics.py      # CLI tool to scrape synced LRC lyrics
│   ├── templates/
│   │   ├── index.html               # Main app shell & sidebar layout
│   │   ├── main.html                # Central player & floating controls
│   │   ├── login.html               # Authentication views
│   │   └── register.html
│   └── static/
│       ├── modern-ui.css            # Responsive glassmorphism design system
│       ├── player.js                # Playback, queue, search, & API logic
│       └── visualizer.js            # Web Audio API visualizations
└── media/                           # Uploaded audio and image files
```

---

## 🚀 Features

### 🎧 Audio & Playback

| Feature | Description |
|---|---|
| **Core Controls** | Play, pause, seek, mute, and adjust volume seamlessly. |
| **Queue System** | Auto-play the next track automatically when the current one finishes. |
| **Keyboard Shortcuts** | Control playback with Space (Play/Pause), Arrow keys (Seek/Volume), `M` (Mute), `F` (Favorite), and Number keys (Jump). |
| **Floating Player** | A sticky mini-player that persists at the bottom of the screen for quick controls while browsing. |

### 📚 Library & Organization

| Feature | Description |
|---|---|
| **Dynamic Sidebar** | A persistent sidebar injected with JSON state for instant client-side song searching without page reloads. |
| **Genre & Album Filters** | Categorize and filter your library effortlessly with visually distinct genre badges. |
| **Real-time Search** | Instantly find songs by title or artist using the responsive sidebar search bar. |
| **Favorites System** | Heart your top tracks to save them to a personalized favorites list (Requires Login). |

### 🌈 Immersion & Visuals

| Feature | Description |
|---|---|
| **Live Visualizer** | Uses the Web Audio API to render real-time visualizations with three modes: Bars, Waveform, and Circular. |
| **Interactive Lyrics** | Time-stamped JSON lyrics that automatically highlight, scroll, and sync as the song progresses. |
| **Glassmorphism UI** | A stunning, premium aesthetic featuring blurred backgrounds, dynamic gradients, and animated album art glows. |
| **Light/Dark Mode** | Seamlessly toggle between dark and light themes, persistently saved across your sessions. |

---

## 🔧 Installation & Development

### Prerequisites

- [Python 3](https://www.python.org/)
- `pip`
- A modern browser that supports the Web Audio API

### Setup

```bash
# Clone the repository
git clone https://github.com/DevRexxxx/Music_Player.git "Music Player"
cd "Music Player"

# Install dependencies
pip install -r requirements.txt

# Environment Setup
# Create a .env file and add your Supabase connection string:
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-SUPABASE-HOST]:5432/postgres

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser for admin access
python manage.py createsuperuser
```

### Running Locally

```bash
# Start the development server
python manage.py runserver
```

> **Note**: Open `http://127.0.0.1:8000/` in your browser. You can manage your songs and genres via the Django admin panel at `http://127.0.0.1:8000/admin/`.

---

## 📝 Version History

| Version | Highlights |
|---|---|
| **v4.0** | **The Advanced Player Update:** Custom Playlists, 3-band Audio Equalizer, OS Media Controls, Queue Management, Sleep Timer, and Real-time Lyrics Translation. |
| **v3.0** | **The REST & UI Update:** Complete glassmorphism redesign, dynamic client-side sidebar, Django REST Framework API, User Auth, Favorites, Albums/Genres models, and `fetch_lyrics` CLI. |
| **v2.0** | **The Interactive Update:** Live Web Audio API visualizer (Bars, Wave, Circular), synced scrolling lyrics, and comprehensive keyboard shortcut controls. |
| **v1.0** | **Initial Release:** Core HTML5 audio playback, basic `Song` model, Django admin integration, and simple server-side pagination. |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  <strong>Built for a smooth listening experience</strong><br/>
  <em>Enjoy your music, your way.</em>
</p>