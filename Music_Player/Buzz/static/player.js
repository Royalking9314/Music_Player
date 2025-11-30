/**
 * Modern Music Player - Enhanced UI and Controls
 * Handles keyboard shortcuts, player controls, UI interactions, and toast notifications
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
        
        // DOM Elements
        this.elements = {};
        
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
        this.setupAudio();
        this.setupVisualizer();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.updateVolumeUI(1);
        
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
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
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
            keyboardHint: document.getElementById('keyboard-hint')
        };
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
        
        // Set initial volume
        this.audio.volume = 1;
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
            // Ignore if typing in input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
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
     * Handle audio ended
     */
    handleEnded() {
        this.isPlaying = false;
        this.updatePlayButtonUI();
        
        // Check if repeat is enabled
        if (this.elements.repeatBtn && this.elements.repeatBtn.classList.contains('active')) {
            this.audio.currentTime = 0;
            this.audio.play();
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
        // Could add loading spinner here
        if (isBuffering) {
            this.elements.playBtn?.classList.add('buffering');
        } else {
            this.elements.playBtn?.classList.remove('buffering');
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
        toast.innerHTML = `
            <span>${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
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
}

// Initialize player when script loads
const musicPlayer = new MusicPlayer();

// Export for external use
window.musicPlayer = musicPlayer;
