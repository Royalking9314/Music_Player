// Lyrics + LIVE AUDIO VISUALIZER background script
// - Parses LRC (timestamped) files or plain text with timestamps
// - Syncs by reading audio.currentTime
// - Uses WebAudio Analyser to create live audio visualizations (frequency bars, circular visualizer, waveform)

(function () {
  const audio = document.getElementById('audio');
  const lrcFileInput = document.getElementById('lrc-file');
  const loadSampleBtn = document.getElementById('load-lrc-sample');
  const lyricsContainer = document.getElementById('lyrics-lines');

  // Canvas setup
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let ww = canvas.width = window.innerWidth;
  let wh = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    ww = canvas.width = window.innerWidth;
    wh = canvas.height = window.innerHeight;
  });

  // WebAudio analyser setup (if supported)
  let analyser, frequencyData, waveformData, audioCtx;
  let audioContextInitialized = false;

  function initAudioContext() {
    if (audioContextInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      const source = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512; // More frequency bins for detailed visualization
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      waveformData = new Uint8Array(analyser.frequencyBinCount);
      audioContextInitialized = true;
    } catch (e) {
      analyser = null;
      frequencyData = null;
      waveformData = null;
      console.warn('WebAudio not available, visuals will be static.');
    }
  }

  // Initialize audio context on user interaction (required by browsers)
  audio.addEventListener('play', () => {
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  });

  // Draw the live audio visualizer
  function draw() {
    const t = Date.now() * 0.001;
    
    // Dark background with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, wh);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0d1025');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ww, wh);

    // Get audio frequency data if available
    let hasAudio = false;
    if (analyser && frequencyData && waveformData) {
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(waveformData);
      // Check if audio is actually playing
      let sum = 0;
      for (let i = 0; i < frequencyData.length; i++) sum += frequencyData[i];
      hasAudio = sum > 100;
    }

    // === VISUALIZATION 1: Circular Audio Visualizer (Center) ===
    drawCircularVisualizer(t, hasAudio);

    // === VISUALIZATION 2: Frequency Bars (Bottom) ===
    drawFrequencyBars(hasAudio);

    // === VISUALIZATION 3: Waveform (Top) ===
    drawWaveform(hasAudio);

    // === VISUALIZATION 4: Audio-reactive particles ===
    drawAudioParticles(t, hasAudio);

    requestAnimationFrame(draw);
  }

  // Circular visualizer in the center
  function drawCircularVisualizer(t, hasAudio) {
    const centerX = ww / 2;
    const centerY = wh / 2;
    const baseRadius = Math.min(ww, wh) * 0.15;
    const bars = 180;

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2;
      let barHeight = baseRadius * 0.1;
      
      if (hasAudio && frequencyData) {
        const freqIndex = Math.floor((i / bars) * frequencyData.length * 0.7);
        barHeight = baseRadius * 0.1 + (frequencyData[freqIndex] / 255) * baseRadius * 0.8;
      } else {
        // Idle animation when no audio
        barHeight = baseRadius * 0.1 + Math.sin(t * 2 + i * 0.1) * baseRadius * 0.05;
      }

      const x1 = Math.cos(angle) * baseRadius;
      const y1 = Math.sin(angle) * baseRadius;
      const x2 = Math.cos(angle) * (baseRadius + barHeight);
      const y2 = Math.sin(angle) * (baseRadius + barHeight);

      // Color based on frequency intensity
      const hue = hasAudio && frequencyData ? 
        200 + (frequencyData[Math.floor((i / bars) * frequencyData.length * 0.7)] / 255) * 100 :
        200 + Math.sin(t + i * 0.05) * 30;
      const alpha = hasAudio ? 0.8 : 0.3;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Inner glowing circle
    const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius);
    const glowIntensity = hasAudio && frequencyData ? 
      (frequencyData[0] + frequencyData[1] + frequencyData[2]) / (255 * 3) : 0.2;
    innerGlow.addColorStop(0, `rgba(100, 200, 255, ${0.1 + glowIntensity * 0.4})`);
    innerGlow.addColorStop(0.5, `rgba(80, 150, 255, ${0.05 + glowIntensity * 0.2})`);
    innerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Frequency bars at the bottom
  function drawFrequencyBars(hasAudio) {
    const barCount = 64;
    const barWidth = ww / barCount;
    const maxBarHeight = wh * 0.25;

    for (let i = 0; i < barCount; i++) {
      let barHeight = 5;
      
      if (hasAudio && frequencyData) {
        const freqIndex = Math.floor((i / barCount) * frequencyData.length * 0.8);
        barHeight = (frequencyData[freqIndex] / 255) * maxBarHeight;
      }

      const x = i * barWidth;
      const y = wh - barHeight;

      // Gradient color based on bar height
      const hue = 180 + (barHeight / maxBarHeight) * 80;
      const gradient = ctx.createLinearGradient(x, wh, x, y);
      gradient.addColorStop(0, `hsla(${hue}, 90%, 50%, 0.9)`);
      gradient.addColorStop(1, `hsla(${hue + 40}, 90%, 70%, 0.6)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);

      // Mirror bars on top (smaller)
      if (hasAudio) {
        const topBarHeight = barHeight * 0.3;
        const topGradient = ctx.createLinearGradient(x, 0, x, topBarHeight);
        topGradient.addColorStop(0, `hsla(${hue}, 90%, 50%, 0.5)`);
        topGradient.addColorStop(1, `hsla(${hue + 40}, 90%, 70%, 0.2)`);
        ctx.fillStyle = topGradient;
        ctx.fillRect(x, 0, barWidth - 2, topBarHeight);
      }
    }
  }

  // Waveform visualization
  function drawWaveform(hasAudio) {
    if (!hasAudio || !waveformData) return;

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100, 255, 200, 0.5)';
    ctx.lineWidth = 2;

    const sliceWidth = ww / waveformData.length;
    let x = 0;
    const centerY = wh / 2;

    for (let i = 0; i < waveformData.length; i++) {
      const v = waveformData[i] / 128.0;
      const y = centerY + (v - 1) * (wh * 0.15);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();
  }

  // Audio-reactive floating particles
  const particles = [];
  const PARTICLE_COUNT = 50;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 2 + Math.random() * 4,
      hue: 180 + Math.random() * 120
    });
  }

  function drawAudioParticles(t, hasAudio) {
    let level = 0.1;
    if (hasAudio && frequencyData) {
      let sum = 0;
      for (let i = 0; i < frequencyData.length; i++) sum += frequencyData[i];
      level = Math.min(1, (sum / frequencyData.length) / 150);
    }

    for (let p of particles) {
      // Particles move faster with audio
      p.x += p.vx * (1 + level * 5);
      p.y += p.vy * (1 + level * 3);

      // Wrap around screen
      if (p.x < 0) p.x = ww;
      if (p.x > ww) p.x = 0;
      if (p.y < 0) p.y = wh;
      if (p.y > wh) p.y = 0;

      // Size pulses with bass frequencies
      const bassLevel = hasAudio && frequencyData ? frequencyData[2] / 255 : 0.1;
      const size = p.size * (1 + bassLevel * 2);
      
      // Alpha based on audio level
      const alpha = 0.2 + level * 0.6;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`;
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(draw);

  // --- Lyrics handling: parse LRC ---
  function parseLRC(text) {
    const lines = text.split(/\r?\n/);
    const entries = [];
    const timeTagRE = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
    for (let raw of lines) {
      let match;
      const tags = [];
      while ((match = timeTagRE.exec(raw)) !== null) {
        const m = parseInt(match[1],10);
        const s = parseInt(match[2],10);
        const ms = match[3] ? parseInt((match[3]+'00').slice(0,3),10) : 0;
        tags.push(m*60 + s + ms/1000);
      }
      const textPart = raw.replace(timeTagRE, '').trim();
      for (let t of tags) {
        entries.push({time: t, text: textPart});
      }
    }
    entries.sort((a,b)=>a.time - b.time);
    return entries;
  }

  let lyricEntries = [];
  let currentIndex = -1;

  function renderLyrics() {
    lyricsContainer.innerHTML = '';
    for (let i=0;i<lyricEntries.length;i++) {
      const div = document.createElement('div');
      div.className = 'lyric';
      div.dataset.index = i;
      div.textContent = lyricEntries[i].text;
      lyricsContainer.appendChild(div);
    }
    highlightCurrent();
  }

  function highlightCurrent() {
    const children = lyricsContainer.children;
    for (let i=0;i<children.length;i++) {
      children[i].classList.toggle('current', i === currentIndex);
    }
    const el = lyricsContainer.children[currentIndex];
    if (el) {
      el.scrollIntoView({behavior:'smooth', block:'center'});
    }
  }

  function updateLyricByTime(t) {
    if (!lyricEntries.length) return;
    let i = currentIndex;
    if (i < 0 || !(lyricEntries[i] && lyricEntries[i+1] && t < lyricEntries[i+1].time)) {
      let lo = 0, hi = lyricEntries.length - 1;
      if (t < lyricEntries[0].time) {
        i = -1;
      } else {
        while (lo <= hi) {
          let mid = (lo + hi) >> 1;
          if (lyricEntries[mid].time <= t) {
            i = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
      }
    }
    if (i !== currentIndex) {
      currentIndex = i;
      highlightCurrent();
    }
  }

  audio.addEventListener('timeupdate', () => {
    updateLyricByTime(audio.currentTime);
  });

  lrcFileInput.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      lyricEntries = parseLRC(reader.result || '');
      renderLyrics();
      currentIndex = -1;
    };
    reader.readAsText(f, 'utf-8');
  });

  loadSampleBtn.addEventListener('click', () => {
    const sample = `[00:00.00] Sample Title
[00:03.00] This is the first line of the lyric
[00:07.20] The chorus starts here
[00:11.50] And continues with another line
[00:15.00] Repeat the chorus
[00:20.00] Final line to end sample`;
    lyricEntries = parseLRC(sample);
    renderLyrics();
    currentIndex = -1;
    audio.currentTime = 0;
    audio.play().catch(()=>{/* user gesture may be required */});
  });

  renderLyrics();

})();
