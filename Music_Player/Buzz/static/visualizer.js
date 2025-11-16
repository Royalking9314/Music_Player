/**
 * Audio Visualizer with Synchronized Lyrics
 * Uses Web Audio API for real-time audio visualization
 */

class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = document.getElementById('fc-media');
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.isPlaying = false;
        this.isEnabled = true;
        this.currentStyle = 'bars';
        this.animationId = null;
        
        // Color gradients
        this.colorOffset = 0;
        
        this.init();
    }
    
    init() {
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup controls
        this.setupControls();
        
        // Initialize on audio play
        this.audio.addEventListener('play', () => {
            if (!this.audioContext) {
                this.setupAudioContext();
            }
            this.isPlaying = true;
            this.animate();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
        });
        
        // Start with a default visualization
        this.drawBackground();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const source = this.audioContext.createMediaElementSource(this.audio);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
        } catch (error) {
            console.error('Error setting up audio context:', error);
        }
    }
    
    setupControls() {
        const toggleBtn = document.getElementById('toggle-visualizer');
        const styleSelect = document.getElementById('visualizer-style');
        
        toggleBtn.addEventListener('click', () => {
            this.isEnabled = !this.isEnabled;
            toggleBtn.classList.toggle('active', this.isEnabled);
            if (!this.isEnabled) {
                this.drawBackground();
            }
        });
        
        styleSelect.addEventListener('change', (e) => {
            this.currentStyle = e.target.value;
        });
    }
    
    animate() {
        if (!this.isPlaying || !this.isEnabled) {
            return;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (!this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Draw based on selected style
        switch (this.currentStyle) {
            case 'bars':
                this.drawBars();
                break;
            case 'circular':
                this.drawCircular();
                break;
            case 'waveform':
                this.drawWaveform();
                break;
        }
        
        this.colorOffset += 0.5;
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBars() {
        this.drawBackground();
        
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;
            
            // Dynamic gradient based on frequency
            const hue = (i / this.bufferLength * 360 + this.colorOffset) % 360;
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
            gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
            gradient.addColorStop(0.5, `hsl(${hue}, 80%, 60%)`);
            gradient.addColorStop(1, `hsl(${hue}, 60%, 70%)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            
            // Draw bar from bottom
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 2;
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawCircular() {
        this.drawBackground();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) / 4;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        const angleStep = (Math.PI * 2) / this.bufferLength;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const angle = i * angleStep;
            const barHeight = (this.dataArray[i] / 255) * radius * 1.5;
            
            const hue = (i / this.bufferLength * 360 + this.colorOffset) % 360;
            
            // Create gradient for each bar
            const x1 = Math.cos(angle) * radius;
            const y1 = Math.sin(angle) * radius;
            const x2 = Math.cos(angle) * (radius + barHeight);
            const y2 = Math.sin(angle) * (radius + barHeight);
            
            this.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }
    
    drawWaveform() {
        this.drawBackground();
        
        const sliceWidth = this.canvas.width / this.bufferLength;
        let x = 0;
        
        // Create gradient for waveform
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, `hsl(${this.colorOffset % 360}, 100%, 50%)`);
        gradient.addColorStop(0.5, `hsl(${(this.colorOffset + 60) % 360}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${(this.colorOffset + 120) % 360}, 100%, 50%)`);
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = `hsl(${this.colorOffset % 360}, 100%, 50%)`;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255.0;
            const y = v * this.canvas.height;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Draw mirror reflection
        this.ctx.beginPath();
        x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255.0;
            const y = this.canvas.height - (v * this.canvas.height);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
}


class LyricsManager {
    constructor() {
        this.audio = document.getElementById('fc-media');
        this.lyricsDisplay = document.getElementById('lyrics-display');
        this.previousLine = this.lyricsDisplay.querySelector('.previous');
        this.currentLine = this.lyricsDisplay.querySelector('.current');
        this.nextLine = this.lyricsDisplay.querySelector('.next');
        this.timestamps = [];
        this.currentIndex = -1;
        this.songId = null;
        
        this.init();
    }
    
    init() {
        // Get song ID from data attribute
        const songData = document.getElementById('song-data');
        if (songData) {
            this.songId = songData.getAttribute('data-song-id');
            this.fetchLyrics();
        }
        
        // Update lyrics on time update
        this.audio.addEventListener('timeupdate', () => this.updateLyrics());
        
        // Reset on song end
        this.audio.addEventListener('ended', () => this.reset());
    }
    
    async fetchLyrics() {
        if (!this.songId) return;
        
        try {
            const response = await fetch(`/api/lyrics/${this.songId}/`);
            const data = await response.json();
            
            if (data.success && data.timestamps && data.timestamps.length > 0) {
                this.timestamps = data.timestamps;
                this.showFirstLine();
            } else {
                // Fallback: show non-synchronized lyrics if available
                if (data.lyrics_text) {
                    this.showStaticLyrics(data.lyrics_text);
                } else {
                    this.showNoLyrics();
                }
            }
        } catch (error) {
            console.error('Error fetching lyrics:', error);
            this.showNoLyrics();
        }
    }
    
    showFirstLine() {
        if (this.timestamps.length > 0) {
            this.nextLine.textContent = this.timestamps[0].text;
            this.nextLine.style.opacity = '0.6';
        }
    }
    
    updateLyrics() {
        if (this.timestamps.length === 0) return;
        
        const currentTime = this.audio.currentTime;
        
        // Find the current line based on time
        let newIndex = -1;
        for (let i = 0; i < this.timestamps.length; i++) {
            if (currentTime >= this.timestamps[i].time) {
                newIndex = i;
            } else {
                break;
            }
        }
        
        // Update display if index changed
        if (newIndex !== this.currentIndex && newIndex >= 0) {
            this.currentIndex = newIndex;
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        // Update previous line
        if (this.currentIndex > 0) {
            this.previousLine.textContent = this.timestamps[this.currentIndex - 1].text;
            this.previousLine.style.opacity = '0.6';
        } else {
            this.previousLine.textContent = '';
            this.previousLine.style.opacity = '0';
        }
        
        // Update current line
        this.currentLine.textContent = this.timestamps[this.currentIndex].text;
        this.currentLine.classList.add('animate');
        setTimeout(() => this.currentLine.classList.remove('animate'), 500);
        
        // Update next line
        if (this.currentIndex < this.timestamps.length - 1) {
            this.nextLine.textContent = this.timestamps[this.currentIndex + 1].text;
            this.nextLine.style.opacity = '0.6';
        } else {
            this.nextLine.textContent = '';
            this.nextLine.style.opacity = '0';
        }
    }
    
    showStaticLyrics(lyrics) {
        // Show static lyrics in the current line
        this.currentLine.textContent = lyrics;
        this.currentLine.style.opacity = '1';
        this.previousLine.style.opacity = '0';
        this.nextLine.style.opacity = '0';
    }
    
    showNoLyrics() {
        this.currentLine.textContent = '♪ No lyrics available ♪';
        this.currentLine.style.opacity = '0.5';
        this.previousLine.style.opacity = '0';
        this.nextLine.style.opacity = '0';
    }
    
    reset() {
        this.currentIndex = -1;
        this.previousLine.textContent = '';
        this.currentLine.textContent = '';
        this.nextLine.textContent = '';
        this.showFirstLine();
    }
}


// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new AudioVisualizer();
    const lyricsManager = new LyricsManager();
});
