/**
 * Audio Visualizer - Web Audio API Implementation
 * Provides multiple visualization modes: Frequency Bars, Waveform, Circular
 */

class AudioVisualizer {
    constructor(audioElement, canvasElement) {
        this.audio = audioElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.animationId = null;
        this.isInitialized = false;
        this.currentMode = 'bars'; // bars, waveform, circular
        
        // Visualization settings
        this.settings = {
            bars: {
                barCount: 64,
                barWidth: 3,
                barGap: 2,
                minHeight: 2,
                smoothing: 0.8
            },
            waveform: {
                lineWidth: 2,
                smoothing: 0.85
            },
            circular: {
                radius: 50,
                barCount: 90,
                smoothing: 0.75
            }
        };
        
        // Colors for gradient
        this.colors = {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            tertiary: '#a855f7',
            quaternary: '#ec4899'
        };
        
        // Bind methods
        this.draw = this.draw.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Set up resize listener
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }
    
    /**
     * Initialize the Web Audio API context and analyser
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = this.settings[this.currentMode].smoothing;
            
            // Connect audio element to analyser
            this.source = this.audioContext.createMediaElementSource(this.audio);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.waveformDataArray = new Uint8Array(this.analyser.fftSize);
            
            this.isInitialized = true;
            this.startVisualization();
        } catch (error) {
            console.error('Error initializing audio visualizer:', error);
        }
    }
    
    /**
     * Resume audio context (needed after user interaction)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        const container = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = container.offsetWidth * dpr;
        this.canvas.height = container.offsetHeight * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.width = container.offsetWidth;
        this.height = container.offsetHeight;
    }
    
    /**
     * Set visualization mode
     */
    setMode(mode) {
        if (['bars', 'waveform', 'circular'].includes(mode)) {
            this.currentMode = mode;
            if (this.analyser) {
                this.analyser.smoothingTimeConstant = this.settings[mode].smoothing;
            }
        }
    }
    
    /**
     * Start the visualization loop
     */
    startVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.draw();
    }
    
    /**
     * Stop the visualization
     */
    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Main draw loop
     */
    draw() {
        this.animationId = requestAnimationFrame(this.draw);
        
        if (!this.analyser) {
            this.drawIdleState();
            return;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Get audio data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Draw based on current mode
        switch (this.currentMode) {
            case 'bars':
                this.drawBars();
                break;
            case 'waveform':
                this.drawWaveform();
                break;
            case 'circular':
                this.drawCircular();
                break;
        }
    }
    
    /**
     * Draw idle state when audio is not playing
     */
    drawIdleState() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const barCount = 20;
        const barWidth = 3;
        const barGap = 4;
        const totalWidth = barCount * (barWidth + barGap);
        const startX = centerX - totalWidth / 2;
        
        const time = Date.now() / 1000;
        
        for (let i = 0; i < barCount; i++) {
            const x = startX + i * (barWidth + barGap);
            const heightMultiplier = Math.sin(time * 2 + i * 0.2) * 0.3 + 0.5;
            const barHeight = 10 + heightMultiplier * 15;
            
            const gradient = this.ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
            gradient.addColorStop(0, this.colors.primary);
            gradient.addColorStop(1, this.colors.secondary);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
        }
    }
    
    /**
     * Draw frequency bars visualization
     */
    drawBars() {
        const settings = this.settings.bars;
        const barCount = Math.min(settings.barCount, this.bufferLength);
        const totalWidth = this.width;
        const barWidth = (totalWidth - (barCount - 1) * settings.barGap) / barCount;
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * this.bufferLength / barCount);
            const value = this.dataArray[dataIndex];
            const percent = value / 255;
            const barHeight = Math.max(settings.minHeight, percent * this.height);
            
            const x = i * (barWidth + settings.barGap);
            const y = this.height - barHeight;
            
            // Create gradient for bar
            const gradient = this.ctx.createLinearGradient(0, this.height, 0, y);
            gradient.addColorStop(0, this.colors.primary);
            gradient.addColorStop(0.5, this.colors.secondary);
            gradient.addColorStop(1, this.colors.tertiary);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            // Use roundRect if available, otherwise fallback to regular rect
            if (this.ctx.roundRect) {
                this.ctx.roundRect(x, y, barWidth, barHeight, 2);
            } else {
                this.ctx.rect(x, y, barWidth, barHeight);
            }
            this.ctx.fill();
            
            // Add glow effect for high values
            if (percent > 0.7) {
                this.ctx.shadowColor = this.colors.primary;
                this.ctx.shadowBlur = 10;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        }
    }
    
    /**
     * Draw waveform visualization
     */
    drawWaveform() {
        this.analyser.getByteTimeDomainData(this.waveformDataArray);
        
        const settings = this.settings.waveform;
        
        // Create gradient for stroke
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0, this.colors.primary);
        gradient.addColorStop(0.33, this.colors.secondary);
        gradient.addColorStop(0.66, this.colors.tertiary);
        gradient.addColorStop(1, this.colors.quaternary);
        
        this.ctx.lineWidth = settings.lineWidth;
        this.ctx.strokeStyle = gradient;
        this.ctx.beginPath();
        
        const sliceWidth = this.width / this.waveformDataArray.length;
        let x = 0;
        
        for (let i = 0; i < this.waveformDataArray.length; i++) {
            const v = this.waveformDataArray[i] / 128.0;
            const y = (v * this.height) / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
        
        // Add glow effect
        this.ctx.shadowColor = this.colors.primary;
        this.ctx.shadowBlur = 5;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // Draw filled area
        this.ctx.globalAlpha = 0.1;
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Draw circular/radial visualization
     */
    drawCircular() {
        const settings = this.settings.circular;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.4;
        
        // Draw bars in a circle
        const barCount = settings.barCount;
        const angleStep = (Math.PI * 2) / barCount;
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * this.bufferLength / barCount);
            const value = this.dataArray[dataIndex];
            const percent = value / 255;
            const barHeight = percent * baseRadius * 1.5;
            
            const angle = i * angleStep - Math.PI / 2;
            const innerRadius = baseRadius;
            const outerRadius = baseRadius + barHeight;
            
            const x1 = centerX + Math.cos(angle) * innerRadius;
            const y1 = centerY + Math.sin(angle) * innerRadius;
            const x2 = centerX + Math.cos(angle) * outerRadius;
            const y2 = centerY + Math.sin(angle) * outerRadius;
            
            // Create gradient
            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, this.colors.primary);
            gradient.addColorStop(1, this.colors.tertiary);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
        
        // Draw center circle
        const avgValue = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength;
        const pulseRadius = baseRadius * 0.6 + (avgValue / 255) * 10;
        
        const centerGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, pulseRadius
        );
        centerGradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        centerGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = centerGradient;
        this.ctx.fill();
        
        // Draw inner ring
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, baseRadius * 0.6, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        this.stopVisualization();
        window.removeEventListener('resize', this.handleResize);
        
        if (this.source) {
            this.source.disconnect();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}

// Export for use
window.AudioVisualizer = AudioVisualizer;
