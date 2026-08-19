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
      console.log('Native share bypassed, downloading file directly...');
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
  }, 1200);
}

// Save JSON helper
export async function downloadJson(data: any, filename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const finalName = filename.endsWith('.json') ? filename : `${filename}.json`;
  await triggerFileDownload(blob, finalName, 'application/json');
}

// Generate Standalone HTML/CSS/JS OBS Browser Source Bundle with ALL Template Styles
export function generateStandaloneHtmlBundle(
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen',
  data: any,
  theme: OverlayTheme
): string {
  const brandPrimary = data?.customTheme?.primaryColor || theme.primaryColor || '#e63946';
  const brandSecondary = data?.customTheme?.secondaryColor || theme.secondaryColor || '#073b4c';
  const brandAccent = data?.customTheme?.accentColor || theme.accentColor || '#ffd166';
  const brandText = theme.textColor || '#ffffff';
  const brandSubtext = theme.subtextColor || '#94a3b8';
  const fontFamily = theme.fontFamily || 'Outfit, sans-serif';

  let bodyContent = '';

  // 1. Lower Third Templates
  if (category === 'lowerThird') {
    const lt = data as LowerThirdData;
    const template = lt.template || 'standard-news';
    const tagBg = lt.tagColor || brandPrimary;

    if (template === 'interview-avatar') {
      bodyContent = `
        <div id="lower-third" class="lower-third-container template-interview ${lt.animation?.entryType || 'slide'}">
          <div class="avatar-box">
            ${lt.avatarUrl 
              ? `<img src="${lt.avatarUrl}" class="avatar-img" style="border-color: ${brandAccent}" alt="Avatar" />` 
              : `<div class="avatar-placeholder" style="background: ${brandPrimary}">${(lt.title || 'A').charAt(0)}</div>`}
            <div class="avatar-star" style="background: ${brandPrimary}">★</div>
          </div>
          <div class="content-box-interview">
            ${lt.tag ? `<div class="tag-badge" style="background: ${tagBg}">${lt.tag}</div>` : ''}
            <div class="title-text">${lt.title || 'NOME DO ENTREVISTADO'}</div>
            <div class="subtitle-text">${lt.subtitle || 'Cargo ou Especialidade'}</div>
          </div>
        </div>
      `;
    } else if (template === 'breaking-bar') {
      bodyContent = `
        <div id="lower-third" class="lower-third-container template-breaking ${lt.animation?.entryType || 'slide'}">
          <div class="breaking-header" style="background: ${brandPrimary}">
            <div class="breaking-pulse-box">
              <span class="live-dot"></span>
              <span class="breaking-alert-icon">⚠</span>
              <span>${lt.tag || 'PLANTÃO URGENTE'}</span>
            </div>
            <span class="breaking-edition">EDIÇÃO EXTRAORDINÁRIA</span>
          </div>
          <div class="breaking-body">
            <div class="title-text breaking-title">${lt.title || 'NOTÍCIA DE ÚLTIMA HORA'}</div>
            <div class="subtitle-text">${lt.subtitle || 'Informações ao vivo da redação'}</div>
          </div>
        </div>
      `;
    } else if (template === 'quote') {
      bodyContent = `
        <div id="lower-third" class="lower-third-container template-quote ${lt.animation?.entryType || 'slide'}" style="border-left-color: ${brandAccent}">
          <div class="quote-icon" style="color: ${brandAccent}">“</div>
          <div class="quote-content">
            <div class="quote-text">"${lt.title || 'Declaração ou frase de impacto'}"</div>
            <div class="quote-author" style="color: ${brandAccent}">— ${lt.subtitle || 'Autor da citação'}</div>
          </div>
        </div>
      `;
    } else if (template === 'modern-minimal') {
      bodyContent = `
        <div id="lower-third" class="lower-third-container template-minimal ${lt.animation?.entryType || 'slide'}">
          <div class="minimal-pill" style="background: ${brandPrimary}"></div>
          <div class="minimal-content">
            <div class="minimal-title">${lt.title || 'DESTAQUE PRINCIPAL'}</div>
            <div class="minimal-subtitle">${lt.subtitle || 'Informações complementares'}</div>
          </div>
        </div>
      `;
    } else if (template === 'school-profile') {
      bodyContent = `
        <div id="lower-third" class="lower-third-container template-profile ${lt.animation?.entryType || 'slide'}" style="border-top-color: ${brandPrimary}">
          <div class="profile-header" style="background: ${brandPrimary}">
            <span class="profile-badge">${lt.tag || 'IMPRENSA ASTRO'}</span>
          </div>
          <div class="profile-body">
            <div class="title-text">${lt.title || 'NOME DO ESTUDANTE / PROFESSOR'}</div>
            <div class="subtitle-text">${lt.subtitle || 'Série / Turma / Matéria'}</div>
          </div>
        </div>
      `;
    } else {
      // Standard News Default
      bodyContent = `
        <div id="lower-third" class="lower-third-container template-standard ${lt.animation?.entryType || 'slide'}">
          <div class="accent-bar" style="background: ${brandPrimary}"></div>
          <div class="content-box">
            ${lt.tag ? `<div class="tag-badge" style="background: ${tagBg}">${lt.tag}</div>` : ''}
            <div class="title-text">${lt.title || 'MANCHETE PRINCIPAL'}</div>
            <div class="subtitle-text">${lt.subtitle || 'Subtítulo e detalhes da reportagem'}</div>
          </div>
          <div class="gold-edge" style="background: ${brandAccent}"></div>
        </div>
      `;
    }
  } else if (category === 'scoreboard') {
    const sb = data as ScoreboardData;
    const teamAColor = sb.teamA?.color || brandPrimary;
    const teamBColor = sb.teamB?.color || '#118ab2';
    const timeFormatted = `${String(sb.matchTime?.minutes || 0).padStart(2, '0')}:${String(sb.matchTime?.seconds || 0).padStart(2, '0')}`;
    const layout = sb.layout || 'compact-bug';

    if (layout === 'bottom-bar') {
      bodyContent = `
        <div id="scoreboard" class="scoreboard-container layout-bottom-bar ${sb.animation?.entryType || 'slide'}">
          <div class="sb-bottom-box">
            <div class="sb-time-col">
              <div class="sb-time" style="color: ${brandAccent}">${timeFormatted}</div>
              <div class="sb-period">${sb.matchTime?.period || '1º TEMPO'}</div>
            </div>
            <div class="sb-team-side">
              <span class="team-color" style="background: ${teamAColor}"></span>
              <span class="team-name">${sb.teamA?.name || 'TIME A'}</span>
              <span class="team-score" style="color: ${brandAccent}">${sb.teamA?.score ?? 0}</span>
            </div>
            <div class="sb-divider">✕</div>
            <div class="sb-team-side">
              <span class="team-score" style="color: ${brandAccent}">${sb.teamB?.score ?? 0}</span>
              <span class="team-name">${sb.teamB?.name || 'TIME B'}</span>
              <span class="team-color" style="background: ${teamBColor}"></span>
            </div>
          </div>
        </div>
      `;
    } else {
      // Compact Bug Default
      bodyContent = `
        <div id="scoreboard" class="scoreboard-container layout-compact ${sb.animation?.entryType || 'slide'}">
          <div class="sb-header">
            <span class="sb-clock" id="match-clock" style="color: ${brandAccent}">${timeFormatted}</span>
            <span class="sb-period">${sb.matchTime?.period || '1º TEMPO'}</span>
          </div>
          <div class="team-row team-a">
            <div class="team-info">
              <span class="team-color" style="background: ${teamAColor}"></span>
              <span class="team-name">${sb.teamA?.shortName || sb.teamA?.name || 'TIME A'}</span>
            </div>
            <span class="team-score" id="score-a" style="color: ${brandAccent}">${sb.teamA?.score ?? 0}</span>
          </div>
          <div class="team-row team-b">
            <div class="team-info">
              <span class="team-color" style="background: ${teamBColor}"></span>
              <span class="team-name">${sb.teamB?.shortName || sb.teamB?.name || 'TIME B'}</span>
            </div>
            <span class="team-score" id="score-b" style="color: ${brandAccent}">${sb.teamB?.score ?? 0}</span>
          </div>
        </div>
      `;
    }
  } else if (category === 'ticker') {
    const tk = data as TickerData;
    const rawItems = (tk.items && tk.items.length > 0) ? tk.items : [
      { id: '1', category: 'NOTÍCIA', categoryColor: brandAccent, text: 'AstroTv Broadcast no ar com cobertura completa' }
    ];
    const itemsHtml = [...rawItems, ...rawItems].map((it) => `
      <div class="ticker-item">
        <span class="category-badge" style="background: ${it.categoryColor || brandAccent}">${it.category}</span>
        <span class="item-text">${it.text}</span>
        <span class="ticker-bullet" style="color: ${brandPrimary}">✦</span>
      </div>
    `).join('');

    bodyContent = `
      <div id="ticker" class="ticker-container ${tk.animation?.entryType || 'slide'}" style="border-top-color: ${brandPrimary}">
        <div class="headline-badge" style="background: ${brandPrimary}; border-right-color: ${brandAccent}">
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
        ${bg.showClock ? `<div class="bug-clock" id="clock" style="color: ${brandAccent}">19:00:00</div>` : ''}
      </div>
    `;
  } else if (category === 'countdown') {
    const cd = data as CountdownData;
    const minutes = Math.floor((cd.targetSeconds || 0) / 60);
    const seconds = (cd.targetSeconds || 0) % 60;
    bodyContent = `
      <div id="countdown" class="countdown-container">
        <div class="cd-box" style="border-top-color: ${brandPrimary}">
          <div class="cd-title">${cd.title || 'A TRANSMISSÃO COMEÇARÁ EM'}</div>
          <div class="cd-timer" id="cd-timer" style="color: ${brandAccent}">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>
          <div class="cd-subtitle">${cd.subtitle || 'AstroTv Imprensa'}</div>
        </div>
      </div>
    `;
  } else if (category === 'fullscreen') {
    const fs = data as FullscreenData;
    bodyContent = `
      <div id="fullscreen" class="fullscreen-container">
        <div class="fs-card" style="border-top-color: ${brandPrimary}">
          ${fs.category ? `<div class="fs-tag" style="background: ${brandPrimary}">${fs.category}</div>` : ''}
          <div class="fs-title">${fs.title || 'COMUNICADO OFICIAL'}</div>
          <div class="fs-subtitle">${fs.subtitle || 'Detalhes da transmissão especial'}</div>
          ${fs.statNumber ? `<div class="fs-stat" style="color: ${brandAccent}">${fs.statNumber}</div>` : ''}
          ${fs.statLabel ? `<div class="fs-stat-label">${fs.statLabel}</div>` : ''}
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
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

    /* Lower Third Base Styles */
    .lower-third-container {
      width: max-content;
      min-width: 420px;
      max-width: 1400px;
    }

    /* Standard News Lower Third */
    .lower-third-container.template-standard {
      position: absolute;
      bottom: 80px;
      left: 80px;
      display: flex;
      align-items: stretch;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.85);
      border: 1px solid rgba(255,255,255,0.18);
    }
    .accent-bar { width: 14px; flex-shrink: 0; }
    .gold-edge { width: 8px; flex-shrink: 0; }
    .content-box {
      background: linear-gradient(90deg, rgba(12,16,26,0.98), rgba(19,25,41,0.96));
      padding: 18px 36px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }
    .tag-badge {
      align-self: flex-start;
      color: #fff;
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 3px 10px;
      border-radius: 2px;
      margin-bottom: 2px;
      font-family: 'Barlow Condensed', sans-serif;
      white-space: nowrap;
    }
    .title-text {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 40px;
      font-weight: 900;
      text-transform: uppercase;
      line-height: 1.1;
      color: #fff;
      letter-spacing: 0.5px;
      white-space: nowrap;
      margin: 0;
      padding: 0;
    }
    .subtitle-text {
      font-size: 19px;
      font-weight: 600;
      color: ${brandSubtext};
      white-space: nowrap;
      line-height: 1.2;
      margin: 0;
      padding: 0;
    }

    /* Interview with Avatar Lower Third */
    .lower-third-container.template-interview {
      position: absolute;
      bottom: 80px;
      left: 80px;
      display: flex;
      align-items: center;
      gap: 20px;
      background: linear-gradient(90deg, rgba(9,13,22,0.98), rgba(20,27,46,0.95), rgba(10,15,29,0.92));
      padding: 16px 36px 16px 20px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.2);
      box-shadow: 0 20px 50px rgba(0,0,0,0.85);
    }
    .avatar-box { position: relative; width: 90px; height: 90px; flex-shrink: 0; }
    .avatar-img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 4px solid; }
    .avatar-placeholder { width: 90px; height: 90px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; color: #fff; }
    .avatar-star { position: absolute; bottom: 0; right: 0; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #fff; border: 2px solid #090d16; }
    .content-box-interview { display: flex; flex-direction: column; justify-content: center; gap: 4px; }

    /* Breaking News Bar Lower Third */
    .lower-third-container.template-breaking {
      position: absolute;
      bottom: 80px;
      left: 80px;
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid ${brandPrimary};
      box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 30px ${brandPrimary}40;
    }
    .breaking-header {
      padding: 8px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
      font-weight: 900;
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-family: 'Barlow Condensed', sans-serif;
      white-space: nowrap;
      gap: 16px;
    }
    .breaking-pulse-box { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
    .breaking-alert-icon { font-size: 16px; }
    .breaking-edition { font-size: 11px; opacity: 0.85; font-family: monospace; white-space: nowrap; }
    .breaking-body {
      background: linear-gradient(90deg, rgba(10,13,22,0.98), rgba(19,25,41,0.96));
      padding: 18px 32px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .breaking-title { color: #fff; font-size: 40px; white-space: nowrap; }

    /* Quote Card Lower Third */
    .lower-third-container.template-quote {
      position: absolute;
      bottom: 80px;
      left: 80px;
      background: linear-gradient(90deg, rgba(13,18,31,0.98), rgba(20,27,44,0.96));
      padding: 24px 36px;
      border-radius: 12px;
      border-left: 8px solid;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.85);
    }
    .quote-icon { font-size: 48px; line-height: 1; font-family: serif; font-weight: 900; }
    .quote-content { display: flex; flex-direction: column; justify-content: center; gap: 6px; }
    .quote-text { font-size: 28px; font-weight: 700; font-style: italic; color: #fff; line-height: 1.2; white-space: nowrap; }
    .quote-author { font-size: 20px; font-weight: 900; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }

    /* Modern Minimal Lower Third */
    .lower-third-container.template-minimal {
      position: absolute;
      bottom: 80px;
      left: 80px;
      display: flex;
      align-items: center;
      gap: 16px;
      background: rgba(15,23,42,0.95);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 16px 32px;
      border-radius: 16px;
      box-shadow: 0 20px 45px rgba(0,0,0,0.85);
      min-width: 380px;
    }
    .minimal-pill { width: 8px; height: 52px; border-radius: 4px; flex-shrink: 0; }
    .minimal-content { display: flex; flex-direction: column; justify-content: center; gap: 2px; }
    .minimal-title { 
      font-family: 'Barlow Condensed', sans-serif; 
      font-size: 34px; 
      font-weight: 900; 
      text-transform: uppercase; 
      color: #ffffff; 
      letter-spacing: 1px; 
      white-space: nowrap; 
      line-height: 1.1; 
      margin: 0; 
      padding: 0; 
    }
    .minimal-subtitle { 
      font-size: 17px; 
      font-weight: 600; 
      color: #94a3b8; 
      letter-spacing: 0.3px; 
      white-space: nowrap; 
      line-height: 1.2; 
      margin: 0; 
      padding: 0; 
    }

    /* School Profile Lower Third */
    .lower-third-container.template-profile {
      position: absolute;
      bottom: 80px;
      left: 80px;
      border-radius: 8px;
      overflow: hidden;
      border-top: 6px solid;
      background: linear-gradient(90deg, rgba(10,13,22,0.98), rgba(19,25,41,0.96));
      box-shadow: 0 20px 50px rgba(0,0,0,0.85);
    }
    .profile-header { padding: 6px 24px; white-space: nowrap; }
    .profile-badge { color: #fff; font-size: 13px; font-weight: 900; text-transform: uppercase; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 1.5px; white-space: nowrap; }
    .profile-body { padding: 16px 28px; display: flex; flex-direction: column; gap: 4px; }

    /* Scoreboard Styles */
    .scoreboard-container.layout-compact {
      position: absolute;
      top: 50px;
      left: 70px;
      background: rgba(9, 13, 22, 0.98);
      border-radius: 10px;
      border: 2px solid rgba(255,255,255,0.22);
      overflow: hidden;
      box-shadow: 0 20px 45px rgba(0,0,0,0.85);
      min-width: 300px;
    }
    .scoreboard-container.layout-bottom-bar {
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
    }
    .sb-bottom-box {
      display: flex;
      align-items: center;
      background: rgba(7, 11, 20, 0.98);
      border-radius: 14px;
      border: 2px solid rgba(255,255,255,0.2);
      box-shadow: 0 20px 50px rgba(0,0,0,0.85);
      overflow: hidden;
    }
    .sb-time-col { background: #030508; padding: 14px 24px; text-align: center; border-right: 1px solid rgba(255,255,255,0.15); }
    .sb-time { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 900; }
    .sb-team-side { display: flex; align-items: center; gap: 14px; padding: 14px 24px; }
    .sb-divider { font-size: 18px; color: #64748b; }
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
    .sb-clock { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 800; }
    .sb-period { color: #94a3b8; text-transform: uppercase; font-size: 12px; }
    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 18px;
      background: #0f1524;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      gap: 16px;
    }
    .team-info { display: flex; align-items: center; gap: 12px; }
    .team-color { width: 10px; height: 28px; border-radius: 2px; }
    .team-name { font-family: 'Barlow Condensed', sans-serif; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
    .team-score {
      font-family: 'JetBrains Mono', monospace;
      font-size: 28px;
      font-weight: 900;
      background: rgba(0,0,0,0.85);
      padding: 2px 14px;
      border-radius: 4px;
      min-width: 42px;
      text-align: center;
    }

    /* Ticker Styles */
    .ticker-container {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 64px;
      background: rgba(7, 10, 18, 0.98);
      border-top: 2px solid;
      display: flex;
      align-items: center;
      overflow: hidden;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.85);
    }
    .headline-badge {
      height: 100%;
      padding: 0 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 22px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      flex-shrink: 0;
      z-index: 10;
      border-right: 4px solid;
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
    .ticker-bullet { font-size: 16px; margin-left: 10px; font-weight: 900; }

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
    .bug-logo { height: 55px; object-fit: contain; }
    .bug-logo-text { font-size: 28px; font-weight: 900; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 2px; }
    .bug-clock { background: rgba(0,0,0,0.85); padding: 3px 10px; border-radius: 4px; font-size: 14px; font-family: monospace; border: 1px solid rgba(255,255,255,0.15); }

    /* Fullscreen */
    .fullscreen-container {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(5, 8, 16, 0.94);
    }
    .fs-card {
      background: rgba(14, 20, 34, 0.98);
      border: 2px solid rgba(255,255,255,0.2);
      border-top: 8px solid;
      border-radius: 20px;
      padding: 48px 64px;
      max-width: 1000px;
      text-align: center;
      box-shadow: 0 30px 80px rgba(0,0,0,0.9);
    }
    .fs-tag {
      display: inline-block;
      color: #fff;
      font-size: 14px;
      font-weight: 900;
      padding: 4px 14px;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 16px;
      letter-spacing: 2px;
      font-family: 'Barlow Condensed', sans-serif;
    }
    .fs-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 52px;
      font-weight: 900;
      text-transform: uppercase;
      line-height: 1.1;
      color: #fff;
      margin-bottom: 12px;
    }
    .fs-subtitle {
      font-size: 22px;
      color: ${brandSubtext};
      font-weight: 600;
      line-height: 1.4;
    }
    .fs-stat {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 110px;
      font-weight: 900;
      margin: 16px 0 0;
      line-height: 1;
    }
    .fs-stat-label {
      font-size: 18px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      font-weight: 700;
    }

    /* Countdown */
    .countdown-container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
    .cd-box { background: rgba(11,15,28,0.98); border: 2px solid rgba(255,255,255,0.2); border-top: 8px solid; border-radius: 24px; padding: 48px 64px; box-shadow: 0 30px 70px rgba(0,0,0,0.9); }
    .cd-title { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
    .cd-timer { font-family: 'JetBrains Mono', monospace; font-size: 120px; font-weight: 900; margin: 10px 0; }
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
</body>
</html>`;
}

// Export 1920x1080 Transparent PNG from dedicated offscreen bundle (Guaranteed Exact Selected Template Style)
export async function exportOverlayItemToPng(
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen',
  data: any,
  theme: OverlayTheme,
  filename: string
): Promise<void> {
  const htmlDoc = generateStandaloneHtmlBundle(category, data, theme);
  
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '1920px';
  iframe.style.height = '1080px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Não foi possível inicializar o motor de renderização.');

    iframeDoc.open();
    iframeDoc.write(htmlDoc);
    iframeDoc.close();

    if (iframeDoc.fonts) {
      await iframeDoc.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 450));

    const stage = (iframeDoc.querySelector('.broadcast-stage') || iframeDoc.body) as HTMLElement;

    const dataUrl = await toPng(stage, {
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      backgroundColor: 'transparent',
      cacheBust: true,
      skipAutoScale: true,
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const finalName = filename.endsWith('.png') ? filename : `${filename}.png`;
    await triggerFileDownload(blob, finalName, 'image/png');
  } catch (error: any) {
    console.error('Failed to export PNG:', error);
    throw new Error('Falha ao gerar PNG transparente: ' + (error.message || 'Erro de renderização'));
  } finally {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}

// High-Speed Animated WebM Video Exporter from dedicated offscreen bundle (Guaranteed Exact Selected Template Style)
export async function exportOverlayItemToWebM(
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen',
  data: any,
  theme: OverlayTheme,
  filename: string,
  durationSeconds: number = 3,
  onProgress?: (pct: number) => void
): Promise<void> {
  const htmlDoc = generateStandaloneHtmlBundle(category, data, theme);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '1920px';
  iframe.style.height = '1080px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Não foi possível inicializar motor de vídeo.');

    iframeDoc.open();
    iframeDoc.write(htmlDoc);
    iframeDoc.close();

    if (iframeDoc.fonts) {
      await iframeDoc.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 450));

    const stage = (iframeDoc.querySelector('.broadcast-stage') || iframeDoc.body) as HTMLElement;

    const snapshotDataUrl = await toPng(stage, {
      width: 1920,
      height: 1080,
      pixelRatio: 1,
      backgroundColor: 'transparent',
      cacheBust: true,
      skipAutoScale: true,
    });

    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('Falha ao processar textura visual do overlay'));
      img.src = snapshotDataUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Não foi possível inicializar o canvas de gravação');

    const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
    if (!stream || typeof MediaRecorder === 'undefined') {
      // Fallback: download high-res transparent PNG
      const res = await fetch(snapshotDataUrl);
      const blob = await res.blob();
      await triggerFileDownload(blob, `${filename}.png`, 'image/png');
      return;
    }

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : '',
      videoBitsPerSecond: 8000000,
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

    const totalFrames = durationSeconds * 30;
    for (let f = 0; f < totalFrames; f++) {
      if (onProgress) onProgress(Math.round((f / totalFrames) * 100));

      ctx.clearRect(0, 0, 1920, 1080);

      // Smooth broadcast entrance curve (first 0.5s is entrance)
      const easeProgress = Math.min(1, f / 15);
      const easeX = 1 - Math.pow(1 - easeProgress, 3);
      const offsetX = (1 - easeX) * -120;
      const alpha = easeProgress;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(offsetX, 0);
      ctx.drawImage(img, 0, 0, 1920, 1080);
      ctx.restore();

      await new Promise((r) => setTimeout(r, 33)); // 30fps = ~33ms
    }

    if (onProgress) onProgress(100);
    recorder.stop();
    await recordingPromise;
  } finally {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}

// Download Single Standalone HTML or ZIP Bundle
export async function downloadStandaloneHtmlFile(
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen',
  data: any,
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
