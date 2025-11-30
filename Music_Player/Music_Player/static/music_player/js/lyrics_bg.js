// Lyrics + animated background script
// - Parses LRC (timestamped) files or plain text with timestamps
// - Syncs by reading audio.currentTime
// - Uses WebAudio Analyser to drive canvas particle effects

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
    createParticles();
  });

  // Particle system
  const particles = [];
  let PARTICLE_COUNT = Math.max(40, Math.floor((ww + wh) / 60));

  function createParticles() {
    particles.length = 0;
    PARTICLE_COUNT = Math.max(40, Math.floor((ww + wh) / 60));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * ww,
        y: Math.random() * wh,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: 2 + Math.random() * 6,
        hue: 180 + Math.random() * 120,
      });
    }
  }
  createParticles();

  // WebAudio analyser setup (if supported)
  let analyser, dataArray;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  } catch (e) {
    analyser = null;
    dataArray = null;
    console.warn('WebAudio not available, visuals will be less reactive.');
  }

  // Draw loop
  function draw() {
    const t = Date.now() * 0.00012;
    // background base color cycling
    const r = Math.floor(10 + Math.abs(Math.sin(t)) * 20);
    const g = Math.floor(10 + Math.abs(Math.cos(t * 1.3)) * 30);
    const b = Math.floor(20 + Math.abs(Math.sin(t * 0.7)) * 40);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0,0,ww,wh);

    let level = 0.3;
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i=0;i<dataArray.length;i++) sum += dataArray[i];
      level = Math.max(0.3, Math.min(1, (sum / dataArray.length) / 160));
    }

    for (let p of particles) {
      p.x += p.vx * (1 + level*8);
      p.y += p.vy * (1 + level*4);

      if (p.x < -50) p.x = ww + 50;
      if (p.x > ww + 50) p.x = -50;
      if (p.y < -50) p.y = wh + 50;
      if (p.y > wh + 50) p.y = -50;

      const size = p.size * (1 + level*2);
      ctx.beginPath();
      const alpha = 0.4 + 0.5 * level * (0.6 + Math.abs(Math.sin(t + p.x * 0.001)));
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, ${alpha})`;
      ctx.arc(p.x, p.y, size, 0, Math.PI*2);
      ctx.fill();
    }

    if (level > 0.15) {
      const rad = Math.min(ww, wh) * (0.15 + level*0.35);
      const grad = ctx.createRadialGradient(ww/2,wh/2, rad*0.1, ww/2,wh/2, rad);
      grad.addColorStop(0, `rgba(255,220,180,${0.08 + level*0.35})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,ww,wh);
    }

    requestAnimationFrame(draw);
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
