import { toPng } from 'html-to-image';
import JSZip from 'jszip';
import { 
  LowerThirdData, 
  ScoreboardData, 
  TickerData, 
  BugData, 
  CountdownData, 
  FullscreenData, 
  OverlayTheme 
} from '../types/broadcast';

// Save JSON helper
export function downloadJson(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export 1920x1080 PNG
export async function exportOverlayToPng(elementId: string, filename: string): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) {
    throw new Error(`Element #${elementId} not found`);
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: 'transparent',
      cacheBust: true,
      skipAutoScale: true,
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw error;
  }
}

// Export animated WebM with transparent background using MediaRecorder & Canvas
export async function exportOverlayToWebM(
  elementId: string, 
  filename: string, 
  durationSeconds: number = 4
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) throw new Error(`Element #${elementId} not found`);

  const width = 1920;
  const height = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not create 2D canvas context');

  // Set up MediaStream from canvas
  const stream = canvas.captureStream(60); // 60 fps
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm;codecs=vp8';
  }
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => {
      try {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.webm') ? filename : `${filename}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    recorder.onerror = (e) => reject(e);
  });

  recorder.start(100);

  const fps = 30;
  const totalFrames = Math.round(durationSeconds * fps);
  const frameDelay = 1000 / fps;

  for (let frame = 0; frame < totalFrames; frame++) {
    try {
      const dataUrl = await toPng(node, {
        backgroundColor: 'transparent',
        cacheBust: true,
        pixelRatio: 1,
      });

      const img = new Image();
      await new Promise<void>((res) => {
        img.onload = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          res();
        };
        img.src = dataUrl;
      });
    } catch (e) {
      console.warn('Frame render error in WebM export', e);
    }
    await new Promise((r) => setTimeout(r, frameDelay));
  }

  recorder.stop();
  await recordingPromise;
}

// Generate Standalone Standalone HTML/CSS/JS OBS Browser Source Bundle
export function generateStandaloneHtmlBundle(
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen',
  data: LowerThirdData | ScoreboardData | TickerData | BugData | CountdownData | FullscreenData,
  theme: OverlayTheme
): string {
  const brandPrimary = theme.primaryColor || '#e63946';
  const brandSecondary = theme.secondaryColor || '#073b4c';
  const brandAccent = theme.accentColor || '#ffd166';
  const brandText = theme.textColor || '#ffffff';
  const brandSubtext = theme.subtextColor || '#94a3b8';
  const fontFamily = theme.fontFamily || 'Outfit, sans-serif';

  let bodyContent = '';

  if (category === 'lowerThird') {
    const lt = data as LowerThirdData;
    const tag = lt.tag ? `<div class="tag-badge">${lt.tag}</div>` : '';
    const avatar = lt.avatarUrl ? `<img src="${lt.avatarUrl}" class="avatar-img" alt="" />` : '';

    bodyContent = `
    <div class="lower-third-container ${lt.animation.entryType}">
      ${avatar}
      <div class="text-group">
        ${tag}
        <div class="main-title">${lt.title}</div>
        <div class="subtitle">${lt.subtitle}</div>
      </div>
    </div>
    `;
  } else if (category === 'scoreboard') {
    const sb = data as ScoreboardData;
    bodyContent = `
    <div class="scoreboard-container ${sb.layout} ${sb.animation.entryType}">
      <div class="time-badge">${String(sb.matchTime.minutes).padStart(2, '0')}:${String(sb.matchTime.seconds).padStart(2, '0')} • ${sb.matchTime.period}</div>
      <div class="teams-wrapper">
        <div class="team team-a" style="border-left: 5px solid ${sb.teamA.color}">
          <span class="team-name">${sb.teamA.shortName || sb.teamA.name}</span>
          <span class="team-score" id="scoreA">${sb.teamA.score}</span>
        </div>
        <div class="score-vs">VS</div>
        <div class="team team-b" style="border-right: 5px solid ${sb.teamB.color}">
          <span class="team-score" id="scoreB">${sb.teamB.score}</span>
          <span class="team-name">${sb.teamB.shortName || sb.teamB.name}</span>
        </div>
      </div>
    </div>
    `;
  } else if (category === 'ticker') {
    const tk = data as TickerData;
    const itemsHtml = tk.items.map(it => `
      <span class="ticker-item">
        <span class="category-badge" style="background:${it.categoryColor || brandAccent}">${it.category}</span>
        <span class="item-text">${it.text}</span>
        <span class="ticker-bullet">✦</span>
      </span>
    `).join('');

    bodyContent = `
    <div class="ticker-bar">
      <div class="ticker-label">
        <span class="pulse-dot"></span> ${tk.headlineTitle || 'ASTRO TV'}
      </div>
      <div class="ticker-content-track">
        <div class="ticker-marquee" style="animation-duration: ${tk.speedSeconds || 25}s">
          ${itemsHtml} ${itemsHtml}
        </div>
      </div>
    </div>
    `;
  } else if (category === 'bug') {
    const bg = data as BugData;
    const live = bg.showLiveBadge ? `<div class="live-tag"><span class="pulse-dot"></span> ${bg.liveBadgeText || 'AO VIVO'}</div>` : '';
    const logo = bg.logoUrl ? `<img src="${bg.logoUrl}" class="bug-logo" alt="Logo" />` : `<div class="bug-logo-text">ASTRO TV</div>`;
    const clock = bg.showClock ? `<div class="clock-display" id="clock">00:00:00</div>` : '';

    bodyContent = `
    <div class="bug-container pos-${bg.position}" style="transform: scale(${bg.scale}); opacity: ${bg.opacity};">
      ${live}
      ${logo}
      ${clock}
    </div>
    `;
  } else if (category === 'countdown') {
    const cd = data as CountdownData;
    bodyContent = `
    <div class="countdown-card ${cd.animation.entryType}">
      <div class="cd-title">${cd.title}</div>
      <div class="cd-timer" id="cdTimer">${Math.floor(cd.targetSeconds / 60)}:${String(cd.targetSeconds % 60).padStart(2, '0')}</div>
      <div class="cd-subtitle">${cd.subtitle}</div>
    </div>
    `;
  } else if (category === 'fullscreen') {
    const fs = data as FullscreenData;
    const itemsHtml = fs.items?.map(it => `<li class="fs-list-item"><span>✦</span> ${it}</li>`).join('') || '';
    const statHtml = fs.statNumber ? `
      <div class="fs-stat-block">
        <div class="fs-stat-num">${fs.statNumber}</div>
        <div class="fs-stat-lbl">${fs.statLabel}</div>
      </div>
    ` : '';

    bodyContent = `
    <div class="fullscreen-overlay ${fs.template} ${fs.animation.entryType}">
      <div class="fs-card">
        <div class="fs-category">${fs.category}</div>
        <h1 class="fs-title">${fs.title}</h1>
        <h3 class="fs-subtitle">${fs.subtitle}</h3>
        ${statHtml}
        ${itemsHtml ? `<ul class="fs-items">${itemsHtml}</ul>` : ''}
        ${fs.quoteAuthor ? `<div class="fs-quote-author">— ${fs.quoteAuthor} <small>${fs.quoteAuthorRole || ''}</small></div>` : ''}
      </div>
    </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0">
  <title>AstroTv Broadcast Source - ${category}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Bebas+Neue&family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background: transparent !important;
      font-family: ${fontFamily};
      color: ${brandText};
      -webkit-font-smoothing: antialiased;
    }
    .broadcast-stage {
      position: relative;
      width: 1920px;
      height: 1080px;
      overflow: hidden;
    }

    /* Lower Third Styles */
    .lower-third-container {
      position: absolute;
      left: 100px;
      bottom: 90px;
      display: flex;
      align-items: center;
      gap: 20px;
      background: rgba(17, 22, 34, 0.94);
      backdrop-filter: blur(16px);
      border-left: 8px solid ${brandPrimary};
      padding: 18px 36px 18px 26px;
      border-radius: 4px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 25px rgba(230, 57, 70, 0.35);
      max-width: 1100px;
    }
    .avatar-img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid ${brandAccent};
      object-fit: cover;
    }
    .tag-badge {
      display: inline-block;
      background: ${brandPrimary};
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 2px;
      margin-bottom: 6px;
    }
    .main-title {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #ffffff;
      line-height: 1.1;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 22px;
      font-weight: 500;
      color: ${brandSubtext};
      margin-top: 4px;
    }

    /* Scoreboard Styles */
    .scoreboard-container {
      position: absolute;
      font-family: 'Barlow Condensed', 'Outfit', sans-serif;
    }
    .scoreboard-container.compact-bug {
      top: 60px;
      left: 80px;
      background: rgba(15, 20, 32, 0.95);
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .time-badge {
      background: #090c13;
      padding: 4px 14px;
      font-size: 14px;
      font-weight: 800;
      color: ${brandAccent};
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .teams-wrapper {
      display: flex;
      align-items: center;
      background: ${brandSecondary};
    }
    .team {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 18px;
    }
    .team-name {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1px;
    }
    .team-score {
      font-size: 32px;
      font-weight: 900;
      background: #000000;
      color: #ffd166;
      padding: 2px 12px;
      border-radius: 4px;
      min-width: 40px;
      text-align: center;
    }
    .score-vs {
      font-size: 14px;
      font-weight: 800;
      color: rgba(255,255,255,0.3);
      padding: 0 4px;
    }

    /* Ticker Styles */
    .ticker-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60px;
      background: rgba(10, 14, 23, 0.96);
      display: flex;
      align-items: center;
      border-top: 3px solid ${brandPrimary};
      box-shadow: 0 -8px 25px rgba(0,0,0,0.5);
    }
    .ticker-label {
      background: ${brandPrimary};
      color: #fff;
      font-size: 20px;
      font-weight: 900;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: 1px;
      white-space: nowrap;
      z-index: 10;
    }
    .ticker-content-track {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
    }
    .ticker-marquee {
      display: inline-block;
      animation: marqueeScroll linear infinite;
    }
    .ticker-item {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-right: 40px;
      font-size: 22px;
      font-weight: 600;
    }
    .category-badge {
      font-size: 13px;
      font-weight: 800;
      color: #000;
      padding: 2px 8px;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .ticker-bullet {
      color: ${brandPrimary};
      margin-left: 20px;
      font-size: 16px;
    }

    /* Bug & Clock */
    .bug-container {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
    }
    .bug-container.pos-top-right { top: 50px; right: 70px; }
    .bug-container.pos-top-left { top: 50px; left: 70px; }
    .bug-container.pos-bottom-right { bottom: 80px; right: 70px; }
    .bug-container.pos-bottom-left { bottom: 80px; left: 70px; }
    .live-tag {
      background: #e63946;
      color: #fff;
      font-size: 14px;
      font-weight: 900;
      padding: 3px 10px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      gap: 6px;
      letter-spacing: 1.5px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #ffffff;
      border-radius: 50%;
      animation: pulseDot 1s infinite alternate;
    }
    .bug-logo {
      height: 48px;
      object-fit: contain;
    }
    .bug-logo-text {
      font-size: 28px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 2px;
    }
    .clock-display {
      font-family: 'Outfit', monospace;
      font-size: 18px;
      font-weight: 700;
      color: #ffd166;
      background: rgba(0,0,0,0.6);
      padding: 2px 8px;
      border-radius: 3px;
    }

    /* Fullscreen & Countdown */
    .fullscreen-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(8, 11, 18, 0.85);
      backdrop-filter: blur(20px);
    }
    .fs-card {
      background: rgba(17, 22, 34, 0.95);
      border: 1px solid rgba(255,255,255,0.1);
      border-top: 6px solid ${brandPrimary};
      border-radius: 8px;
      padding: 60px 80px;
      max-width: 1200px;
      width: 85%;
      box-shadow: 0 30px 80px rgba(0,0,0,0.8);
    }
    .fs-category {
      color: ${brandAccent};
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .fs-title {
      font-size: 56px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 18px;
      color: #ffffff;
    }
    .fs-subtitle {
      font-size: 28px;
      color: ${brandSubtext};
      font-weight: 400;
      margin-bottom: 30px;
    }
    .fs-items {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-size: 26px;
    }
    .fs-list-item span {
      color: ${brandPrimary};
      margin-right: 12px;
    }
    .fs-stat-block {
      display: flex;
      align-items: baseline;
      gap: 20px;
      margin: 20px 0;
    }
    .fs-stat-num {
      font-size: 96px;
      font-weight: 900;
      color: ${brandAccent};
      font-family: 'Barlow Condensed', sans-serif;
    }
    .fs-stat-lbl {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }

    /* Countdown Card */
    .countdown-card {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(17, 22, 34, 0.95);
      border: 2px solid rgba(255,255,255,0.1);
      border-top: 6px solid ${brandPrimary};
      border-radius: 8px;
      padding: 50px 80px;
      text-align: center;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
    }
    .cd-title {
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .cd-timer {
      font-family: 'Barlow Condensed', monospace;
      font-size: 130px;
      font-weight: 900;
      color: ${brandAccent};
      letter-spacing: 4px;
      margin: 10px 0;
      text-shadow: 0 0 30px rgba(255, 209, 102, 0.4);
    }
    .cd-subtitle {
      font-size: 22px;
      color: ${brandSubtext};
      font-weight: 500;
    }

    /* Keyframe Animations */
    @keyframes marqueeScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes pulseDot {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0.3; transform: scale(0.7); }
    }
    @keyframes slideInUp {
      from { transform: translateY(120%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes slideInLeft {
      from { transform: translateX(-120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeInAnim {
      from { opacity: 0; filter: blur(4px); }
      to { opacity: 1; filter: blur(0); }
    }
    @keyframes scaleBounceIn {
      0% { transform: scale(0.7); opacity: 0; }
      70% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes bladeSweepAnim {
      0% { clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%); transform: translateX(-40px); }
      100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); transform: translateX(0); }
    }
    @keyframes curtainRevealAnim {
      0% { clip-path: inset(0 50% 0 50%); opacity: 0; transform: scale(0.95); }
      100% { clip-path: inset(0 0% 0 0%); opacity: 1; transform: scale(1); }
    }
    @keyframes elasticSnapAnim {
      0% { transform: translateX(-140%) skewX(-10deg); opacity: 0; }
      70% { transform: translateX(15px) skewX(3deg); opacity: 1; }
      100% { transform: translateX(0) skewX(0deg); opacity: 1; }
    }
    @keyframes flipUnfoldAnim {
      0% { transform: perspective(1000px) rotateX(-90deg); transform-origin: top; opacity: 0; }
      100% { transform: perspective(1000px) rotateX(0deg); transform-origin: top; opacity: 1; }
    }
    @keyframes headlineShutterAnim {
      0% { clip-path: inset(100% 0 0 0); transform: translateY(40px); opacity: 0; }
      100% { clip-path: inset(0 0 0 0); transform: translateY(0); opacity: 1; }
    }
    @keyframes neonFlareAnim {
      0% { opacity: 0; filter: brightness(2.5); }
      100% { opacity: 1; filter: brightness(1); }
    }
    @keyframes smoothGlideAnim {
      0% { transform: translateY(50px); opacity: 0; filter: blur(6px); }
      100% { transform: translateY(0); opacity: 1; filter: blur(0); }
    }

    .slide { animation: slideInLeft 0.45s cubic-bezier(0.05, 0.9, 0.1, 1.05) forwards; }
    .fade { animation: fadeInAnim 0.4s ease-out forwards; }
    .scale-bounce { animation: scaleBounceIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    .blade-sweep { animation: bladeSweepAnim 0.45s cubic-bezier(0.05, 0.9, 0.1, 1.05) forwards; }
    .curtain-reveal { animation: curtainRevealAnim 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .elastic-snap { animation: elasticSnapAnim 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.35) forwards; }
    .flip-unfold { animation: flipUnfoldAnim 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .headline-shutter { animation: headlineShutterAnim 0.4s cubic-bezier(0.05, 0.9, 0.1, 1.05) forwards; }
    .neon-flare { animation: neonFlareAnim 0.5s ease-out forwards; }
    .smooth-glide { animation: smoothGlideAnim 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  </style>
</head>
<body>
  <div class="broadcast-stage">
    ${bodyContent}
  </div>

  <script>
    // Real-time clock update
    function updateClock() {
      const clockEl = document.getElementById('clock');
      if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString('pt-BR');
      }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Auto-listen to BroadcastChannel for live overlay updates if running in OBS
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('astrotv_broadcast_bus');
      bc.onmessage = (e) => {
        if (e.data && e.data.type === 'UPDATE_SCORE') {
          const scA = document.getElementById('scoreA');
          const scB = document.getElementById('scoreB');
          if (scA && e.data.payload.scoreA !== undefined) scA.innerText = e.data.payload.scoreA;
          if (scB && e.data.payload.scoreB !== undefined) scB.innerText = e.data.payload.scoreB;
        }
      };
    }
  </script>
</body>
</html>`;
}

// Download Standalone HTML bundle as .html or .zip
export async function downloadStandaloneHtmlFile(
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen',
  data: any,
  theme: OverlayTheme,
  filename: string,
  asZip: boolean = false
): Promise<void> {
  const htmlContent = generateStandaloneHtmlBundle(category, data, theme);

  if (!asZip) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    const zip = new JSZip();
    zip.file('index.html', htmlContent);
    zip.file('README_OBS.txt', `AstroTv OBS Browser Source
=====================================================
Como usar no OBS Studio:
1. Abra o OBS Studio.
2. Adicione uma nova fonte: "Navegador" (Browser Source).
3. Marque a opção "Arquivo Local" (Local File).
4. Selecione o arquivo "index.html" descompactado deste pacote.
5. Defina a Largura (Width) para 1920 e Altura (Height) para 1080.
6. Deixe a taxa de quadros (FPS) em 60.
7. O fundo já é 100% transparente com animações prontas!
=====================================================
AstroTv Control Suite — Imprensa Astro
`);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
