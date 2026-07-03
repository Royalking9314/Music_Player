/**
 * Modern Music Player - Enhanced UI and Controls
 * Handles keyboard shortcuts, player controls, UI interactions, toast notifications,
 * sidebar, queue, auto-play, theme toggle, search, and favorites.
 */

class MusicPlayer {
    constructor() {
        this.audio = null;
        this.visualizer = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.previousVolume = 1;
        this.currentTime = 0;
        this.duration = 0;
        this.sidebarOpen = window.innerWidth > 768;
        
        // Queue
        this.songList = [];
        this.queue = [];
        this.queueIndex = -1;
        
        // DOM Elements
        this.elements = {};
        
        // Config
        this.config = window.BUZZ_CONFIG || {};
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the player
     */
    init() {
        this.cacheElements();
        this.loadSongList();
        this.setupAudio();
        this.setupVisualizer();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupThemeToggle();
        this.setupSidebar();
        this.setupFavorites();
        this.setupContextMenu();
        this.updateVolumeUI(1);
        this.renderSongList();
        
        // Show welcome toast
        this.showToast('Welcome! Use Space to play/pause, Arrow keys to seek', 'info');
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Audio
            audio: document.getElementById('audio-player'),
            
            // Visualizer
            visualizerCanvas: document.getElementById('visualizer-canvas'),
            vizModeBtns: document.querySelectorAll('.viz-mode-btn'),
            
            // Progress
            progressBar: document.getElementById('progress-bar'),
            progressFilled: document.getElementById('progress-filled'),
            progressHandle: document.getElementById('progress-handle'),
            currentTimeDisplay: document.getElementById('current-time'),
            durationDisplay: document.getElementById('duration'),
            
            // Floating player progress
            floatingProgressBar: document.getElementById('floating-progress-bar'),
            floatingProgressFilled: document.getElementById('floating-progress-filled'),
            floatingCurrentTime: document.getElementById('floating-current-time'),
            floatingDuration: document.getElementById('floating-duration'),
            
            // Controls
            playBtn: document.getElementById('play-btn'),
            playIcon: document.getElementById('play-icon'),
            pauseIcon: document.getElementById('pause-icon'),
            prevBtn: document.getElementById('prev-nav-btn'),
            nextBtn: document.getElementById('next-nav-btn'),
            shuffleBtn: document.getElementById('shuffle-btn'),
            repeatBtn: document.getElementById('repeat-btn'),
            
            // Floating controls
            floatingPlayBtn: document.getElementById('floating-play-btn'),
            floatingPlayIcon: document.getElementById('floating-play-icon'),
            floatingPauseIcon: document.getElementById('floating-pause-icon'),
            
            // Volume
            volumeBtn: document.getElementById('volume-btn'),
            volumeSlider: document.getElementById('volume-slider'),
            volumeHighIcon: document.getElementById('volume-high-icon'),
            volumeLowIcon: document.getElementById('volume-low-icon'),
            volumeMuteIcon: document.getElementById('volume-mute-icon'),
            floatingVolumeSlider: document.getElementById('floating-volume-slider'),
            
            // Album art
            albumArt: document.getElementById('album-art'),
            albumArtBlur: document.getElementById('album-art-blur'),
            floatingAlbumArt: document.getElementById('floating-album-art'),
            
            // Song info
            songTitle: document.getElementById('song-title'),
            songArtist: document.getElementById('song-artist'),
            floatingSongTitle: document.getElementById('floating-song-title'),
            floatingSongArtist: document.getElementById('floating-song-artist'),
            
            // Lyrics
            lyricsContent: document.getElementById('lyrics-content'),
            
            // Toast container
            toastContainer: document.getElementById('toast-container'),
            
            // Keyboard hint
            keyboardHint: document.getElementById('keyboard-hint'),
            
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            sidebarToggle: document.getElementById('sidebar-toggle'),
            sidebarSearch: document.getElementById('sidebar-search'),
            songListContainer: document.getElementById('song-list'),
            
            // Theme
            themeToggle: document.getElementById('theme-toggle'),
            themeSun: document.getElementById('theme-sun'),
            themeMoon: document.getElementById('theme-moon'),
            
            // Favorite
            favoriteBtn: document.getElementById('favorite-btn'),
        };
    }
    
    /**
     * Load song list from embedded JSON
     */
    loadSongList() {
        try {
            const dataEl = document.getElementById('songs-data');
            if (dataEl) {
                this.songList = JSON.parse(dataEl.textContent);
                this.queue = [...this.songList];
            }
        } catch (e) {
            console.warn('Could not load song list:', e);
        }
    }
    
    /**
     * Setup audio element and events
     */
    setupAudio() {
        this.audio = this.elements.audio;
        
        if (!this.audio) {
            console.error('Audio element not found');
            return;
        }
        
        // Audio events
        this.audio.addEventListener('play', () => this.handlePlay());
        this.audio.addEventListener('pause', () => this.handlePause());
        this.audio.addEventListener('timeupdate', () => this.handleTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this.handleMetadataLoaded());
        this.audio.addEventListener('ended', () => this.handleEnded());
        this.audio.addEventListener('error', (e) => this.handleError(e));
        this.audio.addEventListener('waiting', () => this.handleBuffering(true));
        this.audio.addEventListener('canplay', () => this.handleBuffering(false));
        
        // Set initial volume from localStorage
        const savedVolume = localStorage.getItem('buzz-volume');
        this.audio.volume = savedVolume !== null ? parseFloat(savedVolume) : 1;
        
        // Media Session integration
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateMediaSession();
        });
    }
    
    /**
     * Setup audio visualizer
     */
    setupVisualizer() {
        const canvas = this.elements.visualizerCanvas;
        
        if (!canvas || !this.audio) {
            console.warn('Visualizer canvas or audio not found');
            return;
        }
        
        this.visualizer = new AudioVisualizer(this.audio, canvas);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Play button
        if (this.elements.playBtn) {
            this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        }
        
        if (this.elements.floatingPlayBtn) {
            this.elements.floatingPlayBtn.addEventListener('click', () => this.togglePlay());
        }
        
        // Progress bar click/drag
        if (this.elements.progressBar) {
            this.elements.progressBar.addEventListener('click', (e) => this.handleProgressClick(e));
            this.setupProgressDrag(this.elements.progressBar);
        }
        
        if (this.elements.floatingProgressBar) {
            this.elements.floatingProgressBar.addEventListener('click', (e) => this.handleProgressClick(e));
            this.setupProgressDrag(this.elements.floatingProgressBar);
        }
        
        // Volume controls
        if (this.elements.volumeBtn) {
            this.elements.volumeBtn.addEventListener('click', () => this.toggleMute());
        }
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e));
        }
        
        if (this.elements.floatingVolumeSlider) {
            this.elements.floatingVolumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e));
        }
        
        // Visualization mode buttons
        this.elements.vizModeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setVisualizerMode(btn.dataset.mode));
        });
        
        // Shuffle and repeat buttons
        if (this.elements.shuffleBtn) {
            this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }
        
        if (this.elements.repeatBtn) {
            this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        }
        
        // EQ Sliders
        const eqBass = document.getElementById('eq-bass');
        const eqMid = document.getElementById('eq-mid');
        const eqTreble = document.getElementById('eq-treble');
        
        const updateEQ = () => {
            if (this.visualizer && this.visualizer.isInitialized) {
                this.visualizer.setEQ(eqBass.value, eqMid.value, eqTreble.value);
            } else {
                localStorage.setItem('buzz-eq', JSON.stringify({bass: eqBass.value, mid: eqMid.value, treble: eqTreble.value}));
            }
        };
        
        if (eqBass) eqBass.addEventListener('input', updateEQ);
        if (eqMid) eqMid.addEventListener('input', updateEQ);
        if (eqTreble) eqTreble.addEventListener('input', updateEQ);
        
        const savedEQ = JSON.parse(localStorage.getItem('buzz-eq') || '{"bass":0,"mid":0,"treble":0}');
        if (eqBass) eqBass.value = savedEQ.bass;
        if (eqMid) eqMid.value = savedEQ.mid;
        if (eqTreble) eqTreble.value = savedEQ.treble;

        // Sleep Timer
        const sleepTimer = document.getElementById('sleep-timer');
        if (sleepTimer) {
            sleepTimer.addEventListener('change', (e) => {
                this.setSleepTimer(parseInt(e.target.value) || 0);
            });
        }
    }
    
    /**
     * Setup progress bar drag functionality
     */
    setupProgressDrag(progressBar) {
        let isDragging = false;
        
        const handleDrag = (e) => {
            if (!isDragging) return;
            this.handleProgressClick(e);
        };
        
        const stopDrag = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };
        
        progressBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.handleProgressClick(e);
            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
        });
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input field, textarea, or contenteditable element
            if (e.target.tagName === 'INPUT' || 
                e.target.tagName === 'TEXTAREA' ||
                e.target.isContentEditable ||
                e.target.getAttribute('role') === 'textbox') {
                return;
            }
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    this.showKeyboardHint('Play/Pause');
                    break;
                    
                case 'ArrowLeft':
                    e.preventDefault();
                    this.seek(-10);
                    this.showKeyboardHint('Rewind 10s');
                    break;
                    
                case 'ArrowRight':
                    e.preventDefault();
                    this.seek(10);
                    this.showKeyboardHint('Forward 10s');
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    this.showKeyboardHint('Volume Up');
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustVolume(-0.1);
                    this.showKeyboardHint('Volume Down');
                    break;
                    
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    this.showKeyboardHint(this.isMuted ? 'Muted' : 'Unmuted');
                    break;
                    
                case 'KeyF':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                    
                case 'KeyB':
                    e.preventDefault();
                    this.toggleSidebarVisibility();
                    this.showKeyboardHint('Toggle Sidebar');
                    break;
                    
                case 'Digit1':
                    this.setVisualizerMode('bars');
                    this.showKeyboardHint('Bars Mode');
                    break;
                    
                case 'Digit2':
                    this.setVisualizerMode('waveform');
                    this.showKeyboardHint('Waveform Mode');
                    break;
                    
                case 'Digit3':
                    this.setVisualizerMode('circular');
                    this.showKeyboardHint('Circular Mode');
                    break;
            }
        });
    }
    
    // ===== THEME =====
    
    setupThemeToggle() {
        // Load saved theme
        const savedTheme = localStorage.getItem('buzz-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcons(savedTheme);
        
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('buzz-theme', next);
                this.updateThemeIcons(next);
                this.showToast(`Switched to ${next} theme`, 'info');
            });
        }
    }
    
    updateThemeIcons(theme) {
        if (this.elements.themeSun && this.elements.themeMoon) {
            this.elements.themeSun.style.display = theme === 'dark' ? 'none' : 'block';
            this.elements.themeMoon.style.display = theme === 'dark' ? 'block' : 'none';
        }
    }
    
    // ===== SIDEBAR =====
    
    setupSidebar() {
        // Sidebar toggle
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebarVisibility());
        }
        
        // Search
        if (this.elements.sidebarSearch) {
            this.elements.sidebarSearch.addEventListener('input', (e) => {
                this.filterSongList(e.target.value);
            });
        }
    }
    
    toggleSidebarVisibility() {
        this.sidebarOpen = !this.sidebarOpen;
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.toggle('collapsed', !this.sidebarOpen);
        }
        document.querySelector('.content-area')?.classList.toggle('sidebar-collapsed', !this.sidebarOpen);
    }
    
    renderSongList(songs = null) {
        const list = songs || this.songList;
        const container = this.elements.songListContainer;
        if (!container) return;
        
        if (list.length === 0) {
            container.innerHTML = '<div class="song-list-empty">No songs found</div>';
            return;
        }
        
        const currentPage = this.config.currentPage || 1;
        
        container.innerHTML = list.map((song, index) => {
            const pageNum = this.songList.indexOf(song) + 1;
            const isActive = pageNum === currentPage;
            return `
                <a href="?page=${pageNum}" class="song-item ${isActive ? 'active' : ''}" data-song-id="${song.id}">
                    <img class="song-item-art" src="${song.image_url}" alt="${song.title}" loading="lazy">
                    <div class="song-item-info">
                        <div class="song-item-title">${song.title}</div>
                        <div class="song-item-artist">${song.artist}</div>
                    </div>
                    ${song.is_favorite ? '<span class="song-item-heart">♥</span>' : ''}
                </a>
            `;
        }).join('');
    }
    
    filterSongList(query) {
        const q = query.toLowerCase().trim();
        if (!q) {
            this.renderSongList();
            return;
        }
        const filtered = this.songList.filter(s => 
            s.title.toLowerCase().includes(q) || 
            s.artist.toLowerCase().includes(q) ||
            (s.genre && s.genre.toLowerCase().includes(q))
        );
        this.renderSongList(filtered);
    }
    
    // ===== FAVORITES =====
    
    setupFavorites() {
        if (this.elements.favoriteBtn) {
            this.elements.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }
    }
    
    async toggleFavorite() {
        if (!this.config.isAuthenticated) {
            this.showToast('Please log in to favorite songs', 'info');
            return;
        }
        
        const btn = this.elements.favoriteBtn;
        if (!btn) return;
        
        const songId = btn.dataset.songId;
        
        try {
            const response = await fetch(`/api/favorites/toggle/${songId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.config.csrfToken,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) throw new Error('Failed to toggle favorite');
            
            const data = await response.json();
            
            // Update button UI
            btn.classList.toggle('active', data.favorited);
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.setAttribute('fill', data.favorited ? 'currentColor' : 'none');
            }
            
            // Update sidebar
            const songInList = this.songList.find(s => s.id == songId);
            if (songInList) {
                songInList.is_favorite = data.favorited;
                this.renderSongList();
            }
            
            this.showToast(data.favorited ? 'Added to favorites ♥' : 'Removed from favorites', 'success');
        } catch (error) {
            console.error('Error toggling favorite:', error);
            this.showToast('Error updating favorite', 'error');
        }
    }
    
    // ===== PLAYBACK =====
    
    /**
     * Toggle play/pause
     */
    async togglePlay() {
        if (!this.audio) return;
        
        try {
            // Initialize visualizer on first play
            if (this.visualizer && !this.visualizer.isInitialized) {
                await this.visualizer.init();
            }
            
            // Resume audio context if needed
            if (this.visualizer) {
                await this.visualizer.resume();
            }
            
            if (this.isPlaying) {
                this.audio.pause();
            } else {
                await this.audio.play();
            }
        } catch (error) {
            console.error('Error toggling play:', error);
            this.showToast('Error playing audio', 'error');
        }
    }
    
    /**
     * Handle play event
     */
    handlePlay() {
        this.isPlaying = true;
        this.updatePlayButtonUI();
    }
    
    /**
     * Handle pause event
     */
    handlePause() {
        this.isPlaying = false;
        this.updatePlayButtonUI();
    }
    
    /**
     * Update play button UI
     */
    updatePlayButtonUI() {
        // Main play button
        if (this.elements.playIcon && this.elements.pauseIcon) {
            this.elements.playIcon.style.display = this.isPlaying ? 'none' : 'block';
            this.elements.pauseIcon.style.display = this.isPlaying ? 'block' : 'none';
        }
        
        // Floating play button
        if (this.elements.floatingPlayIcon && this.elements.floatingPauseIcon) {
            this.elements.floatingPlayIcon.style.display = this.isPlaying ? 'none' : 'block';
            this.elements.floatingPauseIcon.style.display = this.isPlaying ? 'block' : 'none';
        }
    }
    
    /**
     * Handle time update
     */
    handleTimeUpdate() {
        if (!this.audio) return;
        
        this.currentTime = this.audio.currentTime;
        this.duration = this.audio.duration || 0;
        
        const progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
        
        // Update progress bars
        if (this.elements.progressFilled) {
            this.elements.progressFilled.style.width = `${progress}%`;
        }
        
        if (this.elements.floatingProgressFilled) {
            this.elements.floatingProgressFilled.style.width = `${progress}%`;
        }
        
        // Update time displays
        if (this.elements.currentTimeDisplay) {
            this.elements.currentTimeDisplay.textContent = this.formatTime(this.currentTime);
        }
        
        if (this.elements.floatingCurrentTime) {
            this.elements.floatingCurrentTime.textContent = this.formatTime(this.currentTime);
        }
    }
    
    /**
     * Handle metadata loaded
     */
    handleMetadataLoaded() {
        this.duration = this.audio.duration;
        
        if (this.elements.durationDisplay) {
            this.elements.durationDisplay.textContent = this.formatTime(this.duration);
        }
        
        if (this.elements.floatingDuration) {
            this.elements.floatingDuration.textContent = this.formatTime(this.duration);
        }
    }
    
    /**
     * Handle audio ended — auto-play next song
     */
    handleEnded() {
        this.isPlaying = false;
        this.updatePlayButtonUI();
        
        // Check if repeat is enabled
        if (this.elements.repeatBtn && this.elements.repeatBtn.classList.contains('active')) {
            this.audio.currentTime = 0;
            this.audio.play();
            return;
        }
        
        // Check Queue
        let queueStr = localStorage.getItem('buzz-queue');
        if (queueStr) {
            let queue = JSON.parse(queueStr);
            if (queue.length > 0) {
                let nextSongId = queue.shift();
                localStorage.setItem('buzz-queue', JSON.stringify(queue));
                this.showToast('Playing next from queue...', 'info');
                setTimeout(() => {
                    window.location.href = `?song_id=${nextSongId}`;
                }, 500);
                return;
            }
        }
        
        // Auto-play next song
        if (this.config.hasNext) {
            this.showToast('Playing next song...', 'info');
            setTimeout(() => {
                window.location.href = `?page=${this.config.nextPage}`;
            }, 500);
        } else {
            this.showToast('End of playlist', 'info');
        }
    }
    
    // ===== MEDIA SESSION =====
    updateMediaSession() {
        if ('mediaSession' in navigator) {
            const titleEl = document.getElementById('song-title');
            const artistEl = document.getElementById('song-artist');
            const imgEl = document.getElementById('album-art');
            
            if (titleEl && artistEl) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: titleEl.textContent,
                    artist: artistEl.textContent,
                    artwork: imgEl ? [{ src: imgEl.src, sizes: '512x512', type: 'image/jpeg' }] : []
                });
                
                navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
                navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
                
                if (this.config.hasPrev) {
                    navigator.mediaSession.setActionHandler('previoustrack', () => {
                        window.location.href = `?page=${this.config.prevPage}`;
                    });
                }
                
                if (this.config.hasNext) {
                    navigator.mediaSession.setActionHandler('nexttrack', () => {
                        window.location.href = `?page=${this.config.nextPage}`;
                    });
                }
            }
        }
    }
    
    /**
     * Handle audio error
     */
    handleError(e) {
        console.error('Audio error:', e);
        this.showToast('Error loading audio file', 'error');
    }
    
    /**
     * Handle buffering state
     */
    handleBuffering(isBuffering) {
        if (isBuffering) {
            this.elements.playBtn?.classList.add('buffering');
            // Show loading skeleton overlay
            document.querySelector('.album-art')?.classList.toggle('loading', true);
        } else {
            this.elements.playBtn?.classList.remove('buffering');
            document.querySelector('.album-art')?.classList.toggle('loading', false);
        }
    }
    
    /**
     * Handle progress bar click
     */
    handleProgressClick(e) {
        if (!this.audio || !this.duration) return;
        
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * this.duration;
        
        this.audio.currentTime = Math.max(0, Math.min(newTime, this.duration));
    }
    
    /**
     * Seek by seconds
     */
    seek(seconds) {
        if (!this.audio) return;
        
        const newTime = this.audio.currentTime + seconds;
        this.audio.currentTime = Math.max(0, Math.min(newTime, this.duration));
    }
    
    /**
     * Handle volume change
     */
    handleVolumeChange(e) {
        const volume = parseFloat(e.target.value) / 100;
        this.setVolume(volume);
    }
    
    /**
     * Set volume
     */
    setVolume(volume) {
        if (!this.audio) return;
        
        volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = volume;
        
        if (volume > 0) {
            this.isMuted = false;
            this.previousVolume = volume;
        }
        
        localStorage.setItem('buzz-volume', volume);
        
        this.updateVolumeUI(volume);
    }
    
    /**
     * Adjust volume by amount
     */
    adjustVolume(amount) {
        if (!this.audio) return;
        
        const newVolume = this.audio.volume + amount;
        this.setVolume(newVolume);
    }
    
    /**
     * Toggle mute
     */
    toggleMute() {
        if (!this.audio) return;
        
        if (this.isMuted) {
            this.audio.volume = this.previousVolume;
            this.isMuted = false;
        } else {
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
            this.isMuted = true;
        }
        
        this.updateVolumeUI(this.audio.volume);
    }
    
    /**
     * Update volume UI
     */
    updateVolumeUI(volume) {
        // Update sliders
        const volumePercent = volume * 100;
        
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = volumePercent;
        }
        
        if (this.elements.floatingVolumeSlider) {
            this.elements.floatingVolumeSlider.value = volumePercent;
        }
        
        // Update icons
        if (this.elements.volumeHighIcon && this.elements.volumeLowIcon && this.elements.volumeMuteIcon) {
            this.elements.volumeHighIcon.style.display = volume > 0.5 ? 'block' : 'none';
            this.elements.volumeLowIcon.style.display = volume > 0 && volume <= 0.5 ? 'block' : 'none';
            this.elements.volumeMuteIcon.style.display = volume === 0 ? 'block' : 'none';
        }
    }
    
    /**
     * Set visualizer mode
     */
    setVisualizerMode(mode) {
        if (this.visualizer) {
            this.visualizer.setMode(mode);
        }
        
        // Update active button
        this.elements.vizModeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }
    
    /**
     * Toggle shuffle
     */
    toggleShuffle() {
        if (this.elements.shuffleBtn) {
            this.elements.shuffleBtn.classList.toggle('active');
            const isActive = this.elements.shuffleBtn.classList.contains('active');
            
            if (isActive) {
                // Shuffle the queue
                this.queue = [...this.songList].sort(() => Math.random() - 0.5);
            } else {
                this.queue = [...this.songList];
            }
            
            this.showToast(isActive ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
        }
    }
    
    /**
     * Toggle repeat
     */
    toggleRepeat() {
        if (this.elements.repeatBtn) {
            this.elements.repeatBtn.classList.toggle('active');
            const isActive = this.elements.repeatBtn.classList.contains('active');
            this.showToast(isActive ? 'Repeat enabled' : 'Repeat disabled', 'info');
        }
    }
    
    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    /**
     * Format time in mm:ss
     */
    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const container = this.elements.toastContainer;
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Create message span with textContent to prevent XSS
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;
        closeBtn.addEventListener('click', () => toast.remove());
        
        toast.appendChild(messageSpan);
        toast.appendChild(closeBtn);
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    /**
     * Show keyboard shortcut hint
     */
    showKeyboardHint(action) {
        const hint = this.elements.keyboardHint;
        if (!hint) return;
        
        hint.textContent = action;
        hint.classList.add('visible');
        
        clearTimeout(this.keyboardHintTimeout);
        this.keyboardHintTimeout = setTimeout(() => {
            hint.classList.remove('visible');
        }, 1500);
    }
    
    // ===== SLEEP TIMER =====
    setSleepTimer(minutes) {
        if (this.sleepTimer) clearTimeout(this.sleepTimer);
        if (minutes > 0) {
            this.showToast(`Sleep timer set for ${minutes} minutes`, 'info');
            this.sleepTimer = setTimeout(() => {
                if (this.isPlaying) this.togglePlay();
                this.showToast('Sleep timer ended playback', 'info');
            }, minutes * 60 * 1000);
        } else {
            this.showToast('Sleep timer cancelled', 'info');
        }
    }
    
    // ===== PLAYLISTS & CONTEXT MENU =====
    async loadPlaylists() {
        if (!this.config.isAuthenticated) return;
        const container = document.getElementById('playlist-list');
        if (!container) return;
        
        try {
            const res = await fetch('/api/playlists/');
            if (!res.ok) return;
            const playlists = await res.json();
            
            container.innerHTML = playlists.map(p => 
                `<div class="genre-chip" style="cursor:pointer;" onclick="musicPlayer.playPlaylist(${p.id})">
                    ${p.title} (${p.songs.length})
                </div>`
            ).join('');
            
            // Expose globally for context menu usage
            window.buzzPlaylists = playlists;
        } catch (e) {
            console.error('Error loading playlists', e);
        }
    }

    async playPlaylist(id) {
        try {
            const res = await fetch(`/api/playlists/${id}/`);
            if (!res.ok) throw new Error('Failed to load playlist');
            const playlist = await res.json();
            
            if (playlist.songs && playlist.songs.length > 0) {
                const songIds = playlist.songs.map(s => s.id);
                localStorage.setItem('buzz-queue', JSON.stringify(songIds.slice(1)));
                window.location.href = `?song_id=${songIds[0]}`;
            } else {
                this.showToast('Playlist is empty', 'error');
            }
        } catch (e) {
            console.error('Error playing playlist', e);
        }
    }
    
    setupContextMenu() {
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu glass-container';
        this.contextMenu.style.cssText = 'display:none; position:absolute; z-index:9999; padding:8px; border-radius:8px; min-width:150px;';
        this.contextMenu.innerHTML = `
            <div class="menu-item" id="ctx-add-queue" style="padding:8px; cursor:pointer;">Add to Queue</div>
            <div class="menu-item" id="ctx-add-playlist" style="padding:8px; cursor:pointer;">Add to Playlist</div>
        `;
        document.body.appendChild(this.contextMenu);
        
        document.addEventListener('click', () => { this.contextMenu.style.display = 'none'; });
        this.contextMenu.addEventListener('click', (e) => e.stopPropagation());
        
        const songListContainer = document.getElementById('song-list');
        if (songListContainer) {
            songListContainer.addEventListener('contextmenu', (e) => {
                const songItem = e.target.closest('.song-item');
                if (songItem) {
                    e.preventDefault();
                    this.contextMenuSongId = songItem.dataset.songId;
                    this.contextMenu.style.display = 'block';
                    this.contextMenu.style.left = `${e.pageX}px`;
                    this.contextMenu.style.top = `${e.pageY}px`;
                }
            });
        }
        
        document.getElementById('ctx-add-queue').addEventListener('click', () => {
            let queueStr = localStorage.getItem('buzz-queue');
            let queue = queueStr ? JSON.parse(queueStr) : [];
            queue.push(this.contextMenuSongId);
            localStorage.setItem('buzz-queue', JSON.stringify(queue));
            this.showToast('Added to Queue', 'success');
            this.contextMenu.style.display = 'none';
        });
        
        document.getElementById('ctx-add-playlist').addEventListener('click', async () => {
            this.contextMenu.style.display = 'none';
            if (!this.config.isAuthenticated) {
                this.showToast('Please log in to use playlists', 'info');
                return;
            }
            
            const pName = prompt("Enter existing playlist name or a new one to create:");
            if (!pName) return;
            
            try {
                let pid = null;
                const playlists = window.buzzPlaylists || [];
                const existing = playlists.find(p => p.title.toLowerCase() === pName.toLowerCase());
                
                if (existing) {
                    pid = existing.id;
                } else {
                    const res = await fetch('/api/playlists/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': this.config.csrfToken
                        },
                        body: JSON.stringify({ title: pName, songs: [] })
                    });
                    if (res.ok) {
                        const newP = await res.json();
                        pid = newP.id;
                    }
                }
                
                if (pid) {
                    await fetch(`/api/playlists/${pid}/add_song/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': this.config.csrfToken
                        },
                        body: JSON.stringify({ song_id: this.contextMenuSongId })
                    });
                    this.showToast('Added to Playlist', 'success');
                    this.loadPlaylists();
                }
            } catch (e) {
                this.showToast('Failed to add to playlist', 'error');
            }
        });
        
        // Also load playlists on init
        this.loadPlaylists();
        
        // Setup create playlist button
        const createPlaylistBtn = document.getElementById('create-playlist-btn');
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', async () => {
                if (!this.config.isAuthenticated) {
                    this.showToast('Please log in to create playlists', 'info');
                    return;
                }
                const pName = prompt("Enter new playlist name:");
                if (!pName) return;
                try {
                    const res = await fetch('/api/playlists/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': this.config.csrfToken
                        },
                        body: JSON.stringify({ title: pName, songs: [] })
                    });
                    if (res.ok) {
                        this.showToast('Playlist created!', 'success');
                        this.loadPlaylists();
                    }
                } catch (e) {
                    this.showToast('Failed to create playlist', 'error');
                }
            });
        }
    }
}

// Initialize player when script loads
const musicPlayer = new MusicPlayer();

// Export for external use
window.musicPlayer = musicPlayer;
