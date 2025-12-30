/**
 * Lyrics Sync Editor
 * Allows users to create and edit synchronized lyrics
 */

class LyricsSyncEditor {
    constructor(audio, lyricsContainer, songId) {
        this.audio = audio;
        this.lyricsContainer = lyricsContainer;
        this.songId = songId;
        this.isEditMode = false;
        this.isSyncMode = false;
        this.currentLineIndex = 0;
        this.syncedLyrics = [];
        this.originalLyrics = '';
        this.lyricsLines = [];
        
        this.init();
    }
    
    init() {
        this.createEditorUI();
        this.setupEventListeners();
    }
    
    /**
     * Create the editor UI elements
     */
    createEditorUI() {
        // Get or create the lyrics header
        let lyricsHeader = this.lyricsContainer.parentElement.querySelector('.lyrics-header');
        
        if (!lyricsHeader) {
            lyricsHeader = document.createElement('div');
            lyricsHeader.className = 'lyrics-header';
            this.lyricsContainer.parentElement.insertBefore(lyricsHeader, this.lyricsContainer);
        }
        
        // Check if Edit Sync button already exists
        if (!document.getElementById('edit-sync-btn')) {
            // Create Edit Sync button
            const editSyncBtn = document.createElement('button');
            editSyncBtn.id = 'edit-sync-btn';
            editSyncBtn.className = 'edit-sync-btn';
            editSyncBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span>Edit Sync</span>
            `;
            
            // Find the nav-controls div to insert before it
            const navControls = lyricsHeader.querySelector('.nav-controls');
            if (navControls) {
                lyricsHeader.insertBefore(editSyncBtn, navControls);
            } else {
                lyricsHeader.appendChild(editSyncBtn);
            }
        }
        
        // Create sync controls panel (hidden by default)
        if (!document.getElementById('sync-controls')) {
            const syncControls = document.createElement('div');
            syncControls.id = 'sync-controls';
            syncControls.className = 'sync-controls hidden';
            syncControls.innerHTML = `
                <div class="sync-controls-header">
                    <h3>Sync Lyrics Mode</h3>
                    <p class="sync-instructions">Play the song and tap "Mark Time" when each line should appear</p>
                </div>
                <div class="sync-controls-actions">
                    <button id="start-sync-btn" class="sync-btn primary">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        Start Sync
                    </button>
                    <button id="mark-time-btn" class="sync-btn secondary" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Mark Time (Space)
                    </button>
                    <button id="preview-sync-btn" class="sync-btn secondary" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Preview
                    </button>
                    <button id="reset-sync-btn" class="sync-btn secondary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        Reset
                    </button>
                    <button id="save-sync-btn" class="sync-btn success" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Save
                    </button>
                    <button id="cancel-sync-btn" class="sync-btn danger">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Cancel
                    </button>
                </div>
                <div class="sync-progress">
                    <span id="sync-progress-text">Ready to sync</span>
                    <div class="sync-progress-bar">
                        <div id="sync-progress-fill" class="sync-progress-fill" style="width: 0%"></div>
                    </div>
                </div>
            `;
            
            this.lyricsContainer.parentElement.insertBefore(syncControls, this.lyricsContainer);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Edit Sync button
        const editSyncBtn = document.getElementById('edit-sync-btn');
        if (editSyncBtn) {
            editSyncBtn.addEventListener('click', () => this.toggleEditMode());
        }
        
        // Start Sync button
        const startSyncBtn = document.getElementById('start-sync-btn');
        if (startSyncBtn) {
            startSyncBtn.addEventListener('click', () => this.startSyncMode());
        }
        
        // Mark Time button
        const markTimeBtn = document.getElementById('mark-time-btn');
        if (markTimeBtn) {
            markTimeBtn.addEventListener('click', () => this.markTimestamp());
        }
        
        // Preview button
        const previewBtn = document.getElementById('preview-sync-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.previewSync());
        }
        
        // Reset button
        const resetBtn = document.getElementById('reset-sync-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSync());
        }
        
        // Save button
        const saveBtn = document.getElementById('save-sync-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSyncedLyrics());
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-sync-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelEdit());
        }
        
        // Keyboard shortcut for marking time (Space key during sync mode)
        document.addEventListener('keydown', (e) => {
            if (this.isSyncMode && e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.markTimestamp();
            }
        });
        
        // Click on timestamp to edit
        this.lyricsContainer.addEventListener('click', (e) => {
            if (this.isEditMode && e.target.classList.contains('timestamp-edit')) {
                this.editTimestamp(e.target);
            }
        });
    }
    
    /**
     * Toggle edit mode
     */
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editSyncBtn = document.getElementById('edit-sync-btn');
        const syncControls = document.getElementById('sync-controls');
        
        if (this.isEditMode) {
            editSyncBtn.classList.add('active');
            syncControls.classList.remove('hidden');
            this.prepareForEditing();
        } else {
            editSyncBtn.classList.remove('active');
            syncControls.classList.add('hidden');
            this.exitEditMode();
        }
    }
    
    /**
     * Prepare lyrics for editing
     */
    prepareForEditing() {
        // Get original lyrics text
        const lyricsDataAttr = this.lyricsContainer.getAttribute('data-lyrics');
        
        if (!lyricsDataAttr) {
            this.showNotification('No lyrics available to sync', 'error');
            this.toggleEditMode();
            return;
        }
        
        // Check if lyrics are already synced
        try {
            const parsedLyrics = JSON.parse(lyricsDataAttr);
            if (Array.isArray(parsedLyrics) && parsedLyrics.length > 0) {
                // Already synced
                this.syncedLyrics = parsedLyrics;
                this.renderEditableLyrics(parsedLyrics);
                document.getElementById('preview-sync-btn').disabled = false;
                document.getElementById('save-sync-btn').disabled = false;
                this.updateProgress(`${parsedLyrics.length} lines synced`);
                return;
            }
        } catch (e) {
            // Plain text lyrics
            this.originalLyrics = lyricsDataAttr;
        }
        
        // Split plain text lyrics into lines
        this.lyricsLines = this.originalLyrics.split('\n').filter(line => line.trim() !== '');
        this.syncedLyrics = this.lyricsLines.map(line => ({
            lyrics: line,
            time: null
        }));
        
        this.renderEditableLyrics(this.syncedLyrics);
        this.updateProgress('Ready to sync');
    }
    
    /**
     * Render lyrics in editable format
     */
    renderEditableLyrics(lyricsData) {
        this.lyricsContainer.innerHTML = lyricsData.map((item, index) => {
            const timeDisplay = item.time ? `[${item.time}]` : '[--:--.--]';
            const synced = item.time !== null;
            return `
                <div class="lyrics-line-edit ${synced ? 'synced' : 'unsynced'}" data-index="${index}">
                    <span class="timestamp-edit" data-index="${index}" contenteditable="${synced}">${timeDisplay}</span>
                    <span class="lyrics-text">${this.escapeHtml(item.lyrics)}</span>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Start sync mode
     */
    startSyncMode() {
        this.isSyncMode = true;
        this.currentLineIndex = 0;
        
        // Enable mark time button
        document.getElementById('mark-time-btn').disabled = false;
        
        // Reset all timestamps
        this.syncedLyrics = this.syncedLyrics.map(item => ({
            lyrics: item.lyrics,
            time: null
        }));
        
        this.renderEditableLyrics(this.syncedLyrics);
        
        // Highlight first line
        this.highlightCurrentLine();
        
        // Start playing if not already
        if (this.audio.paused) {
            this.audio.play();
        }
        
        // Seek to beginning
        this.audio.currentTime = 0;
        
        this.updateProgress('Syncing: Press Space or Mark Time when each line starts');
        this.showNotification('Sync mode started! Press Space when each line begins', 'info');
    }
    
    /**
     * Mark timestamp for current line
     */
    markTimestamp() {
        if (!this.isSyncMode || this.currentLineIndex >= this.syncedLyrics.length) {
            return;
        }
        
        const currentTime = this.audio.currentTime;
        const timeString = this.formatTime(currentTime);
        
        this.syncedLyrics[this.currentLineIndex].time = timeString;
        
        // Update UI
        const lineElement = this.lyricsContainer.querySelector(`[data-index="${this.currentLineIndex}"]`);
        if (lineElement) {
            lineElement.classList.remove('unsynced');
            lineElement.classList.add('synced');
            const timestampElement = lineElement.querySelector('.timestamp-edit');
            timestampElement.textContent = `[${timeString}]`;
        }
        
        this.currentLineIndex++;
        
        if (this.currentLineIndex < this.syncedLyrics.length) {
            this.highlightCurrentLine();
            const progress = (this.currentLineIndex / this.syncedLyrics.length) * 100;
            this.updateProgressBar(progress);
            this.updateProgress(`Syncing: ${this.currentLineIndex}/${this.syncedLyrics.length} lines`);
        } else {
            // All lines synced
            this.completeSyncMode();
        }
    }
    
    /**
     * Complete sync mode
     */
    completeSyncMode() {
        this.isSyncMode = false;
        document.getElementById('mark-time-btn').disabled = true;
        document.getElementById('preview-sync-btn').disabled = false;
        document.getElementById('save-sync-btn').disabled = false;
        
        this.updateProgressBar(100);
        this.updateProgress(`All ${this.syncedLyrics.length} lines synced! You can now preview or save.`);
        this.showNotification('Sync complete! You can preview or save now.', 'success');
        
        // Remove highlighting
        const lines = this.lyricsContainer.querySelectorAll('.lyrics-line-edit');
        lines.forEach(line => line.classList.remove('current-line'));
    }
    
    /**
     * Highlight current line during sync
     */
    highlightCurrentLine() {
        const lines = this.lyricsContainer.querySelectorAll('.lyrics-line-edit');
        lines.forEach((line, index) => {
            line.classList.toggle('current-line', index === this.currentLineIndex);
        });
        
        // Scroll to current line
        const currentLine = lines[this.currentLineIndex];
        if (currentLine) {
            currentLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    /**
     * Preview synced lyrics
     */
    previewSync() {
        if (this.syncedLyrics.every(item => item.time === null)) {
            this.showNotification('No timestamps set. Please sync lyrics first.', 'error');
            return;
        }
        
        // Exit edit mode temporarily
        this.isEditMode = false;
        document.getElementById('edit-sync-btn').classList.remove('active');
        document.getElementById('sync-controls').classList.add('hidden');
        
        // Render preview
        this.renderPreview();
        
        // Start playing from beginning
        this.audio.currentTime = 0;
        this.audio.play();
        
        this.showNotification('Preview mode - watching synced lyrics', 'info');
    }
    
    /**
     * Render preview of synced lyrics
     */
    renderPreview() {
        // Store the synced lyrics temporarily in the container
        this.lyricsContainer.setAttribute('data-lyrics', JSON.stringify(this.syncedLyrics));
        
        // Render lyrics
        this.lyricsContainer.innerHTML = this.syncedLyrics.map((item, index) => 
            `<p class="lyrics-line" data-index="${index}">${this.escapeHtml(item.lyrics)}</p>`
        ).join('');
        
        // Setup preview highlighting
        this.setupPreviewHighlighting();
    }
    
    /**
     * Setup preview highlighting
     */
    setupPreviewHighlighting() {
        let currentIndex = 0;
        
        const updateHighlight = () => {
            const currentTime = this.audio.currentTime;
            
            // Find current line
            let newIndex = 0;
            for (let i = 0; i < this.syncedLyrics.length; i++) {
                if (this.syncedLyrics[i].time && currentTime >= this.timeToSeconds(this.syncedLyrics[i].time)) {
                    newIndex = i;
                }
            }
            
            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                const lines = this.lyricsContainer.querySelectorAll('.lyrics-line');
                lines.forEach((line, i) => {
                    line.classList.toggle('active-line', i === currentIndex);
                });
                
                // Scroll to current line
                const activeLine = lines[currentIndex];
                if (activeLine) {
                    activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        };
        
        // Remove existing listener if any
        if (this.previewListener) {
            this.audio.removeEventListener('timeupdate', this.previewListener);
        }
        
        this.previewListener = updateHighlight;
        this.audio.addEventListener('timeupdate', this.previewListener);
    }
    
    /**
     * Reset sync
     */
    resetSync() {
        if (confirm('Are you sure you want to reset all timestamps?')) {
            this.syncedLyrics = this.syncedLyrics.map(item => ({
                lyrics: item.lyrics,
                time: null
            }));
            
            this.currentLineIndex = 0;
            this.isSyncMode = false;
            this.renderEditableLyrics(this.syncedLyrics);
            
            document.getElementById('mark-time-btn').disabled = true;
            document.getElementById('preview-sync-btn').disabled = true;
            document.getElementById('save-sync-btn').disabled = true;
            
            this.updateProgressBar(0);
            this.updateProgress('Ready to sync');
            this.showNotification('Timestamps reset', 'info');
        }
    }
    
    /**
     * Save synced lyrics to backend
     */
    async saveSyncedLyrics() {
        if (this.syncedLyrics.some(item => item.time === null)) {
            if (!confirm('Some lines are not synced. Do you want to save anyway?')) {
                return;
            }
        }
        
        try {
            const response = await fetch(`/save-synced-lyrics/${this.songId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.syncedLyrics)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Synced lyrics saved successfully!', 'success');
                
                // Update the data attribute
                this.lyricsContainer.setAttribute('data-lyrics', JSON.stringify(this.syncedLyrics));
                
                // Exit edit mode
                this.toggleEditMode();
                
                // Reload page after short delay to show updated lyrics
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                this.showNotification(`Error: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showNotification('Failed to save synced lyrics', 'error');
        }
    }
    
    /**
     * Cancel edit mode
     */
    cancelEdit() {
        if (this.isSyncMode || this.syncedLyrics.some(item => item.time !== null)) {
            if (!confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
                return;
            }
        }
        
        this.toggleEditMode();
    }
    
    /**
     * Exit edit mode
     */
    exitEditMode() {
        this.isSyncMode = false;
        this.currentLineIndex = 0;
        
        // Remove preview listener if exists
        if (this.previewListener) {
            this.audio.removeEventListener('timeupdate', this.previewListener);
            this.previewListener = null;
        }
        
        // Restore original lyrics display
        const lyricsDataAttr = this.lyricsContainer.getAttribute('data-lyrics');
        try {
            const parsedLyrics = JSON.parse(lyricsDataAttr);
            if (Array.isArray(parsedLyrics) && parsedLyrics.length > 0) {
                this.lyricsContainer.innerHTML = parsedLyrics.map((item, index) => 
                    `<p class="lyrics-line" data-index="${index}">${this.escapeHtml(item.lyrics)}</p>`
                ).join('');
            } else {
                this.lyricsContainer.innerHTML = `<p class="lyrics-line">${this.escapeHtml(lyricsDataAttr)}</p>`;
            }
        } catch (e) {
            this.lyricsContainer.innerHTML = `<p class="lyrics-line">${this.escapeHtml(lyricsDataAttr)}</p>`;
        }
    }
    
    /**
     * Edit timestamp manually
     */
    editTimestamp(element) {
        const index = parseInt(element.getAttribute('data-index'));
        const currentTime = element.textContent.replace(/[\[\]]/g, '');
        
        element.addEventListener('blur', () => {
            const newTime = element.textContent.replace(/[\[\]]/g, '').trim();
            if (this.isValidTimeFormat(newTime)) {
                this.syncedLyrics[index].time = newTime;
                element.textContent = `[${newTime}]`;
            } else {
                element.textContent = `[${currentTime}]`;
                this.showNotification('Invalid time format. Use mm:ss.ss', 'error');
            }
        });
    }
    
    /**
     * Validate time format
     */
    isValidTimeFormat(time) {
        return /^\d+:\d{2}(\.\d+)?$/.test(time);
    }
    
    /**
     * Format time in mm:ss.ss
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${mins}:${secs.padStart(5, '0')}`;
    }
    
    /**
     * Convert time string to seconds
     */
    timeToSeconds(time) {
        const [minutes, seconds] = time.split(':').map(parseFloat);
        return minutes * 60 + seconds;
    }
    
    /**
     * Update progress text
     */
    updateProgress(text) {
        const progressText = document.getElementById('sync-progress-text');
        if (progressText) {
            progressText.textContent = text;
        }
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar(percent) {
        const progressFill = document.getElementById('sync-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use the existing music player's toast notification if available
        if (window.musicPlayer && window.musicPlayer.showToast) {
            window.musicPlayer.showToast(message, type);
        } else {
            alert(message);
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audio-player');
    const lyricsContainer = document.getElementById('lyrics-content');
    
    if (audio && lyricsContainer) {
        // Get song ID from the page context
        const songIdElement = document.querySelector('[data-song-id]');
        const songId = songIdElement ? songIdElement.getAttribute('data-song-id') : null;
        
        if (songId) {
            window.lyricsSyncEditor = new LyricsSyncEditor(audio, lyricsContainer, songId);
        }
    }
});
