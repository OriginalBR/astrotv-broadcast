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

// Universal Download / Share trigger for Desktop & Mobile (Android/iOS)
export async function triggerFileDownload(
  blob: Blob, 
  filename: string, 
  mimeType: string = 'application/octet-stream'
): Promise<void> {
  // 1. Try Native Web Share API if available on Mobile devices
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
          text: 'Overlay exportado do AstroTv Broadcast',
        });
        return;
      }
    } catch (e) {
      // If user cancels share or not supported, continue with standard download
      console.log('Native share bypassed, downloading file...');
    }
  }

  // 2. Standard Blob ObjectURL download trigger
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// Save JSON helper
export async function downloadJson(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const finalName = filename.endsWith('.json') ? filename : `${filename}.json`;
  await triggerFileDownload(blob, finalName, 'application/json');
}

// Export 1920x1080 Transparent PNG
export async function exportOverlayToPng(elementId: string, filename: string): Promise<void> {
  let node = document.getElementById(elementId) || document.getElementById('astro-output-stage');
  
  if (!node) {
    // Fallback: look for any export container
    node = document.querySelector('[id^="export-"]') || document.body;
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: 'transparent',
      cacheBust: true,
      skipAutoScale: true,
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const finalName = filename.endsWith('.png') ? filename : `${filename}.png`;
    await triggerFileDownload(blob, finalName, 'image/png');
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw new Error('Falha ao gerar PNG transparente. Verifique se o overlay está visível na tela.');
  }
}

// High-Speed Animated WebM Video Exporter with Progress and Fallback
export async function exportOverlayToWebM(
  elementId: string, 
  filename: string, 
  durationSeconds: number = 3,
  onProgress?: (pct: number) => void
): Promise<void> {
  let node = document.getElementById(elementId) || document.getElementById('astro-output-stage');
  if (!node) {
    node = document.querySelector('[id^="export-"]') || document.body;
  }

  const width = 1920;
  const height = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Não foi possível inicializar o canvas de vídeo.');

  // Pre-render base snapshot to prevent heavy DOM thrashing
  let snapshotDataUrl: string;
  try {
    snapshotDataUrl = await toPng(node, {
      backgroundColor: 'transparent',
      cacheBust: true,
      pixelRatio: 1,
    });
  } catch (err) {
    throw new Error('Erro ao capturar visual do overlay para o vídeo.');
  }

  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('Falha ao carregar imagem base do overlay'));
    img.src = snapshotDataUrl;
  });

  // Set up MediaStream from canvas
  const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
  if (!stream) {
    // If MediaStream canvas capture is unsupported on this mobile browser, fallback to PNG download
    console.warn('Canvas captureStream not supported, falling back to PNG export');
    const res = await fetch(snapshotDataUrl);
    const blob = await res.blob();
    await triggerFileDownload(blob, `${filename}.png`, 'image/png');
    return;
  }

  let mimeType = 'video/webm;codecs=vp9';
  if (typeof MediaRecorder !== 'undefined') {
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
  } else {
    // Fallback if MediaRecorder is missing
    const res = await fetch(snapshotDataUrl);
    const blob = await res.blob();
    await triggerFileDownload(blob, `${filename}.png`, 'image/png');
    return;
  }

  const recorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : '',
    videoBitsPerSecond: 5000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<void>((resolve, reject) => {
    recorder.onstop = async () => {
      try {
        const finalBlob = new Blob(chunks, { type: mimeType });
        const finalName = filename.endsWith('.webm') ? filename : `${filename}.webm`;
        await triggerFileDownload(finalBlob, finalName, mimeType);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    recorder.onerror = (e) => reject(e);
  });

  recorder.start(100);

  // Render smooth animated motion on canvas (simulating broadcast entrance & subtle shine)
  const totalFrames = durationSeconds * 30;
  const startTime = Date.now();

  for (let f = 0; f < totalFrames; f++) {
    const progress = f / totalFrames;
    if (onProgress) onProgress(Math.round(progress * 100));

    ctx.clearRect(0, 0, width, height);

    // Entry slide animation curve
    const easeProgress = Math.min(1, f / 18); // first 0.6s is entry
    const easeX = 1 - Math.pow(1 - easeProgress, 3);
    const offsetX = (1 - easeX) * -120;
    const alpha = easeProgress;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(offsetX, 0);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();

    await new Promise((r) => setTimeout(r, 33)); // 30fps = ~33ms
  }

  if (onProgress) onProgress(100);
  recorder.stop();
  await recordingPromise;
}

// Generate Standalone HTML/CSS/JS OBS Browser Source Bundle
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

  // 1. Lower Third Standalone HTML
  if (category === 'lowerThird') {
    const lt = data as LowerThirdData;
    bodyContent = `
      <div id="lower-third" class="lower-third-container ${lt.animation?.entryType || 'slide'}">
        <div class="accent-bar"></div>
        <div class="content-box">
          ${lt.tag ? `<div class="tag-badge">${lt.tag}</div>` : ''}
          <div class="title-text">${lt.title || ''}</div>
          <div class="subtitle-text">${lt.subtitle || ''}</div>
        </div>
        <div class="gold-edge"></div>
      </div>
    `;
  } else if (category === 'scoreboard') {
    const sb = data as ScoreboardData;
    const timeFormatted = `${String(sb.matchTime?.minutes || 0).padStart(2, '0')}:${String(sb.matchTime?.seconds || 0).padStart(2, '0')}`;
    bodyContent = `
      <div id="scoreboard" class="scoreboard-container compact-bug ${sb.animation?.entryType || 'slide'}">
        <div class="sb-header">
          <span class="sb-clock" id="match-clock">${timeFormatted}</span>
          <span class="sb-period">${sb.matchTime?.period || '1º TEMPO'}</span>
        </div>
        <div class="team-row team-a">
          <div class="team-info">
            <span class="team-color" style="background: ${sb.teamA?.color || brandPrimary}"></span>
            <span class="team-name">${sb.teamA?.shortName || sb.teamA?.name || 'TIME A'}</span>
          </div>
          <span class="team-score" id="score-a">${sb.teamA?.score ?? 0}</span>
        </div>
        <div class="team-row team-b">
          <div class="team-info">
            <span class="team-color" style="background: ${sb.teamB?.color || '#118ab2'}"></span>
            <span class="team-name">${sb.teamB?.shortName || sb.teamB?.name || 'TIME B'}</span>
          </div>
          <span class="team-score" id="score-b">${sb.teamB?.score ?? 0}</span>
        </div>
      </div>
    `;
  } else if (category === 'ticker') {
    const tk = data as TickerData;
    const itemsHtml = [...(tk.items || []), ...(tk.items || [])].map((it) => `
      <div class="ticker-item">
        <span class="category-badge" style="background: ${it.categoryColor || brandAccent}">${it.category}</span>
        <span class="item-text">${it.text}</span>
        <span class="ticker-bullet">✦</span>
      </div>
    `).join('');

    bodyContent = `
      <div id="ticker" class="ticker-container ${tk.animation?.entryType || 'slide'}">
        <div class="headline-badge">
          <span class="live-dot"></span>
          <span>${tk.headlineTitle || 'ASTRO NOTÍCIAS'}</span>
        </div>
        <div class="ticker-track-wrapper">
          <div class="ticker-marquee" style="animation-duration: ${tk.speedSeconds || 25}s">
            ${itemsHtml}
          </div>
        </div>
      </div>
    `;
  } else if (category === 'bug') {
    const bg = data as BugData;
    bodyContent = `
      <div id="bug" class="bug-container pos-${bg.position || 'top-right'}">
        ${bg.showLiveBadge ? '<div class="live-tag"><span class="pulse-dot"></span>' + (bg.liveBadgeText || 'AO VIVO') + '</div>' : ''}
        ${bg.logoUrl ? `<img src="${bg.logoUrl}" class="bug-logo" alt="Logo" />` : '<div class="bug-logo-text">ASTRO TV</div>'}
        ${bg.showClock ? '<div class="bug-clock" id="clock">00:00:00</div>' : ''}
      </div>
    `;
  } else if (category === 'countdown') {
    const cd = data as CountdownData;
    const minutes = Math.floor((cd.targetSeconds || 0) / 60);
    const seconds = (cd.targetSeconds || 0) % 60;
    bodyContent = `
      <div id="countdown" class="countdown-container">
        <div class="cd-box">
          <div class="cd-title">${cd.title || 'INÍCIO EM'}</div>
          <div class="cd-timer" id="cd-timer">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
          <div class="cd-subtitle">${cd.subtitle || ''}</div>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0" />
  <title>AstroTv Broadcast Overlay — ${category}</title>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      background-color: transparent !important;
      font-family: ${fontFamily};
      color: ${brandText};
      user-select: none;
    }
    .broadcast-stage {
      position: relative;
      width: 1920px;
      height: 1080px;
      background: transparent;
      overflow: hidden;
    }

    /* Lower Third Styles */
    .lower-third-container {
      position: absolute;
      bottom: 80px;
      left: 80px;
      display: flex;
      align-items: stretch;
      max-width: 1100px;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .accent-bar { width: 14px; background: ${brandPrimary}; flex-shrink: 0; }
    .gold-edge { width: 8px; background: ${brandAccent}; flex-shrink: 0; }
    .content-box {
      background: linear-gradient(90deg, rgba(12,16,26,0.98), rgba(19,25,41,0.95));
      padding: 18px 32px;
      min-width: 440px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .tag-badge {
      align-self: flex-start;
      background: ${brandPrimary};
      color: #fff;
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 3px 10px;
      border-radius: 2px;
      margin-bottom: 6px;
    }
    .title-text {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 38px;
      font-weight: 900;
      text-transform: uppercase;
      line-height: 1.1;
      color: #fff;
    }
    .subtitle-text {
      font-size: 19px;
      font-weight: 600;
      color: ${brandSubtext};
      margin-top: 4px;
    }

    /* Scoreboard Styles */
    .scoreboard-container {
      position: absolute;
      top: 50px;
      left: 70px;
      background: rgba(9, 13, 22, 0.98);
      border-radius: 10px;
      border: 2px solid rgba(255,255,255,0.2);
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
      min-width: 280px;
    }
    .sb-header {
      background: #030509;
      padding: 6px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 800;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      font-family: 'Barlow Condensed', sans-serif;
    }
    .sb-clock { color: ${brandAccent}; font-family: monospace; font-size: 15px; }
    .sb-period { color: #94a3b8; text-transform: uppercase; }
    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: #0f1524;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      gap: 16px;
    }
    .team-info { display: flex; align-items: center; gap: 10px; }
    .team-color { width: 10px; height: 26px; border-radius: 2px; }
    .team-name { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 900; text-transform: uppercase; }
    .team-score {
      font-family: monospace;
      font-size: 24px;
      font-weight: 900;
      color: ${brandAccent};
      background: rgba(0,0,0,0.8);
      padding: 2px 12px;
      border-radius: 4px;
      min-width: 36px;
      text-align: center;
    }

    /* Ticker Styles */
    .ticker-container {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 62px;
      background: rgba(7, 10, 18, 0.98);
      border-top: 2px solid ${brandPrimary};
      display: flex;
      align-items: center;
      overflow: hidden;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.8);
    }
    .headline-badge {
      height: 100%;
      padding: 0 24px;
      background: ${brandPrimary};
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 20px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      flex-shrink: 0;
      z-index: 10;
      border-right: 4px solid ${brandAccent};
    }
    .live-dot { width: 10px; height: 10px; border-radius: 50%; background: #fff; animation: pulseDot 1s infinite alternate; }
    .ticker-track-wrapper { flex: 1; overflow: hidden; white-space: nowrap; }
    .ticker-marquee { display: inline-flex; align-items: center; animation: marqueeScroll linear infinite; }
    .ticker-item { display: inline-flex; align-items: center; gap: 14px; margin-right: 36px; }
    .category-badge {
      font-size: 13px;
      font-weight: 900;
      color: #000;
      padding: 3px 10px;
      border-radius: 4px;
      text-transform: uppercase;
      font-family: 'Barlow Condensed', sans-serif;
    }
    .item-text { font-size: 22px; font-weight: 600; }
    .ticker-bullet { color: ${brandPrimary}; font-size: 16px; margin-left: 10px; font-weight: 900; }

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
      font-size: 13px;
      font-weight: 900;
      padding: 3px 12px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: 1.5px;
      font-family: 'Barlow Condensed', sans-serif;
    }
    .pulse-dot { width: 8px; height: 8px; background: #fff; border-radius: 50%; animation: pulseDot 1s infinite alternate; }
    .bug-logo { height: 50px; object-fit: contain; }
    .bug-logo-text { font-size: 28px; font-weight: 900; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 2px; }
    .bug-clock { background: rgba(0,0,0,0.85); padding: 3px 10px; border-radius: 4px; font-size: 13px; font-family: monospace; color: ${brandAccent}; border: 1px solid rgba(255,255,255,0.15); }

    /* Countdown */
    .countdown-container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .cd-box { background: rgba(11,15,28,0.98); border: 2px solid rgba(255,255,255,0.2); border-top: 8px solid ${brandPrimary}; border-radius: 24px; padding: 48px 64px; box-shadow: 0 30px 70px rgba(0,0,0,0.9); }
    .cd-title { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
    .cd-timer { font-family: monospace; font-size: 120px; font-weight: 900; color: ${brandAccent}; margin: 10px 0; }
    .cd-subtitle { font-size: 20px; color: ${brandSubtext}; font-weight: 600; }

    /* Keyframe Animations */
    @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes pulseDot { from { opacity: 1; transform: scale(1); } to { opacity: 0.3; transform: scale(0.7); } }
    @keyframes slideInLeft { from { transform: translateX(-120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeInAnim { from { opacity: 0; filter: blur(4px); } to { opacity: 1; filter: blur(0); } }
    .slide { animation: slideInLeft 0.45s cubic-bezier(0.05, 0.9, 0.1, 1.05) forwards; }
    .fade { animation: fadeInAnim 0.4s ease-out forwards; }
  </style>
</head>
<body>
  <div class="broadcast-stage">
    ${bodyContent}
  </div>
  <script>
    function updateClock() {
      const clockEl = document.getElementById('clock');
      if (clockEl) clockEl.innerText = new Date().toLocaleTimeString('pt-BR');
    }
    setInterval(updateClock, 1000);
    updateClock();
  </script>
</body>
</html>`;
}

// Download Single Standalone HTML or ZIP Bundle
export async function downloadStandaloneHtmlFile(
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen',
  data: LowerThirdData | ScoreboardData | TickerData | BugData | CountdownData | FullscreenData,
  theme: OverlayTheme,
  filename: string,
  isZip: boolean = false
): Promise<void> {
  const htmlContent = generateStandaloneHtmlBundle(category, data, theme);

  if (!isZip) {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const finalName = filename.endsWith('.html') ? filename : `${filename}.html`;
    await triggerFileDownload(blob, finalName, 'text/html');
  } else {
    const zip = new JSZip();
    zip.file('overlay.html', htmlContent);
    zip.file(
      'README_CONFIGURACAO_OBS.txt',
      `COMO ADICIONAR NO OBS STUDIO:\n\n1. No OBS Studio, crie uma nova fonte do tipo "Navegador" (Browser Source).\n2. Marque a opção "Arquivo Local" (Local File).\n3. Selecione o arquivo "overlay.html".\n4. Defina a Largura: 1920 e Altura: 1080.\n5. Defina o FPS como 60.\n6. Pronto! O fundo é 100% transparente.`
    );
    const content = await zip.generateAsync({ type: 'blob' });
    const finalName = filename.endsWith('.zip') ? filename : `${filename}.zip`;
    await triggerFileDownload(content, finalName, 'application/zip');
  }
}
