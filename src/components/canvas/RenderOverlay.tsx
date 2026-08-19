import React, { useEffect, useState } from 'react';
import { 
  LowerThirdData, 
  ScoreboardData, 
  TickerData, 
  BugData, 
  CountdownData, 
  FullscreenData, 
  OverlayTheme,
  TransitionState,
  AnimationType
} from '../../types/broadcast';
import { Sparkles, Radio, Clock, Quote, AlertTriangle, Flame } from 'lucide-react';

interface RenderOverlayProps {
  lowerThird?: LowerThirdData | null;
  scoreboard?: ScoreboardData | null;
  ticker?: TickerData | null;
  bug?: BugData | null;
  countdown?: CountdownData | null;
  fullscreen?: FullscreenData | null;
  transition?: TransitionState | null;
  theme: OverlayTheme;
  stationName?: string;
  isBlackout?: boolean;
}

// Helper to map AnimationType to broadcast motion classes
export function getBroadcastMotionClass(type?: AnimationType | string): string {
  switch (type) {
    case 'blade-sweep': return 'animate-blade-sweep';
    case 'curtain-reveal': return 'animate-curtain-reveal';
    case 'elastic-snap': return 'animate-elastic-snap';
    case 'flip-unfold': return 'animate-flip-unfold';
    case 'headline-shutter': return 'animate-headline-shutter';
    case 'neon-flare': return 'animate-neon-flare';
    case 'smooth-glide': return 'animate-smooth-glide';
    case 'glitch-in': return 'animate-glitch-tv';
    case 'scale-bounce': return 'animate-scale-bounce';
    case 'slide': return 'animate-slide-right';
    case 'wipe': return 'animate-wipe-left';
    case 'fade': return 'animate-fade-in';
    case 'typewriter': return 'animate-slide-up';
    default: return 'animate-slide-right';
  }
}

export const RenderOverlay: React.FC<RenderOverlayProps> = ({
  lowerThird,
  scoreboard,
  ticker,
  bug,
  countdown,
  fullscreen,
  transition,
  theme,
  stationName = 'ASTRO TV',
  isBlackout = false,
}) => {
  if (isBlackout) {
    return <div className="absolute inset-0 bg-black z-50 pointer-events-none" />;
  }

  const isTickerActive = !!ticker;

  return (
    <div className="relative w-full h-full overflow-hidden select-none pointer-events-none font-sans">
      {/* 1. Fullscreen Graphic Layer */}
      {fullscreen && (
        <FullscreenRenderer data={fullscreen} theme={theme} />
      )}

      {/* 2. Countdown Layer */}
      {countdown && (
        <CountdownRenderer data={countdown} theme={theme} />
      )}

      {/* 3. Lower Third Layer */}
      {lowerThird && (
        <LowerThirdRenderer data={lowerThird} theme={theme} isTickerActive={isTickerActive} />
      )}

      {/* 4. Scoreboard Layer (Always rendered if activeScoreboard is set) */}
      {scoreboard && (
        <ScoreboardRenderer data={scoreboard} theme={theme} isTickerActive={isTickerActive} />
      )}

      {/* 5. Ticker Layer (Fixed at bottom with auto-fitting text) */}
      {ticker && (
        <TickerRenderer data={ticker} theme={theme} stationName={stationName} />
      )}

      {/* 6. Bug / Watermark / Clock Layer */}
      {bug && (
        <BugRenderer data={bug} theme={theme} stationName={stationName} isTickerActive={isTickerActive} />
      )}

      {/* 7. Transition Stinger Layer */}
      {transition && transition.isActive && (
        <TransitionRenderer transition={transition} theme={theme} stationName={stationName} />
      )}
    </div>
  );
};

// --- LOWER THIRD RENDERER ---
const LowerThirdRenderer: React.FC<{ data: LowerThirdData; theme: OverlayTheme; isTickerActive: boolean }> = ({ 
  data, 
  theme,
  isTickerActive 
}) => {
  const primaryColor = data.customTheme?.primaryColor || theme.primaryColor || '#e63946';
  const accentColor = data.customTheme?.accentColor || theme.accentColor || '#ffd166';
  const animClass = getBroadcastMotionClass(data.animation?.entryType);
  const bottomPosition = isTickerActive ? 'bottom-[80px]' : 'bottom-[50px]';

  return (
    <div 
      id="export-lower-third"
      className={`absolute ${bottomPosition} left-[80px] max-w-[1100px] z-30 transition-all duration-300 ${animClass}`}
    >
      {/* Template: Standard News */}
      {data.template === 'standard-news' && (
        <div className="flex items-stretch shadow-2xl rounded-sm overflow-hidden border border-white/20 backdrop-blur-2xl broadcast-shimmer">
          <div 
            className="w-4 flex-shrink-0 animate-pulse-fast" 
            style={{ backgroundColor: primaryColor }} 
          />
          
          <div className="bg-gradient-to-r from-[#0c101a]/98 via-[#131929]/95 to-[#0e1422]/95 px-8 py-5 flex flex-col justify-center min-w-[440px]">
            {data.tag && (
              <div className="flex items-center gap-2 mb-1.5">
                <span 
                  className="px-3 py-0.5 text-xs font-black uppercase tracking-widest text-white rounded-xs shadow-md"
                  style={{ backgroundColor: data.tagColor || primaryColor }}
                >
                  {data.tag}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </div>
            )}
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-none font-condensed drop-shadow-md">
              {data.title}
            </h2>
            <p className="text-lg lg:text-xl font-semibold text-slate-300 mt-1">
              {data.subtitle}
            </p>
          </div>

          <div className="w-2 flex-shrink-0" style={{ backgroundColor: accentColor }} />
        </div>
      )}

      {/* Template: Interview with Avatar */}
      {data.template === 'interview-avatar' && (
        <div className="flex items-center gap-5 bg-gradient-to-r from-[#090d16]/98 via-[#141b2e]/95 to-[#0a0f1d]/90 p-4 pr-10 rounded-xl shadow-2xl border border-white/20 backdrop-blur-2xl broadcast-shimmer">
          {data.avatarUrl ? (
            <div className="relative">
              <img 
                src={data.avatarUrl} 
                alt={data.title} 
                className="w-24 h-24 rounded-full object-cover shadow-2xl"
                style={{ border: `4px solid ${accentColor}` }}
              />
              <div 
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg border-2 border-[#090d16]"
                style={{ backgroundColor: primaryColor }}
              >
                ★
              </div>
            </div>
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white shadow-inner"
              style={{ backgroundColor: primaryColor }}
            >
              {data.title.charAt(0)}
            </div>
          )}
          <div>
            {data.tag && (
              <span 
                className="inline-block px-3 py-0.5 text-xs font-black uppercase tracking-wider text-black rounded mb-1 font-condensed shadow"
                style={{ backgroundColor: data.tagColor || accentColor }}
              >
                {data.tag}
              </span>
            )}
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight font-condensed">
              {data.title}
            </h2>
            <p className="text-lg font-medium text-slate-300">
              {data.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Template: Breaking Bar (Plantão Urgente) */}
      {data.template === 'breaking-bar' && (
        <div className="shadow-2xl overflow-hidden rounded-md border-2 border-red-600 broadcast-glow-red broadcast-shimmer">
          <div className="bg-red-600 text-white px-6 py-2 flex items-center justify-between font-black text-sm tracking-widest uppercase animate-pulse-fast">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
              <AlertTriangle className="w-4 h-4" />
              <span>{data.tag || 'PLANTÃO URGENTE'}</span>
            </div>
            <span className="text-[11px] font-mono opacity-80">ED. EXTRAORDINÁRIA</span>
          </div>
          <div className="bg-gradient-to-r from-[#0a0d16]/98 to-[#131929]/95 px-8 py-5 backdrop-blur-2xl">
            <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-red-50 leading-none font-condensed drop-shadow">
              {data.title}
            </h2>
            <p className="text-lg font-medium text-slate-300 mt-1.5">
              {data.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Template: Quote Card */}
      {data.template === 'quote' && (
        <div className="bg-gradient-to-r from-[#0d121f]/98 to-[#141b2c]/95 p-6 rounded-lg shadow-2xl border-l-8 border-yellow-400 max-w-[920px] backdrop-blur-xl broadcast-shimmer">
          <div className="flex items-start gap-4">
            <Quote className="w-12 h-12 text-yellow-400 flex-shrink-0 opacity-80" />
            <div>
              <p className="text-2xl lg:text-3xl font-bold italic text-white tracking-tight leading-snug">
                "{data.title}"
              </p>
              <p className="text-lg font-bold text-yellow-400 mt-2 uppercase tracking-wider font-condensed">
                — {data.subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Template: Modern Minimal */}
      {data.template === 'modern-minimal' && (
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/60 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-2xl broadcast-shimmer">
          <div className="w-2.5 h-11 rounded-full animate-pulse-fast" style={{ backgroundColor: primaryColor }} />
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white uppercase tracking-wider font-condensed">
              {data.title}
            </h2>
            <p className="text-sm font-semibold text-slate-400 tracking-wide">
              {data.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Template: School / Imprensa Astro Profile */}
      {data.template === 'school-profile' && (
        <div className="flex items-center gap-6 bg-gradient-to-r from-[#080e24]/98 via-[#131d3b]/95 to-[#0b132b]/95 p-5 rounded-2xl border border-cyan-400/40 shadow-2xl backdrop-blur-2xl broadcast-shimmer">
          {data.avatarUrl && (
            <img 
              src={data.avatarUrl} 
              alt={data.title} 
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-cyan-400 shadow-xl"
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-cyan-500 text-black px-2.5 py-0.5 text-xs font-black rounded uppercase tracking-wider shadow">
                {data.tag || 'IMPRENSA ASTRO'}
              </span>
              <span className="text-xs text-cyan-300 font-bold uppercase tracking-widest">★ DESTAQUE ACADÊMICO</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black uppercase text-white font-condensed tracking-wide">
              {data.title}
            </h2>
            <p className="text-base font-semibold text-cyan-100/90">
              {data.subtitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SCOREBOARD RENDERER (100% Visible & Robust) ---
const ScoreboardRenderer: React.FC<{ data: ScoreboardData; theme: OverlayTheme; isTickerActive: boolean }> = ({ 
  data, 
  theme,
  isTickerActive 
}) => {
  const [pulseScoreA, setPulseScoreA] = useState(false);
  const [pulseScoreB, setPulseScoreB] = useState(false);

  useEffect(() => {
    setPulseScoreA(true);
    const t = setTimeout(() => setPulseScoreA(false), 500);
    return () => clearTimeout(t);
  }, [data.teamA?.score]);

  useEffect(() => {
    setPulseScoreB(true);
    const t = setTimeout(() => setPulseScoreB(false), 500);
    return () => clearTimeout(t);
  }, [data.teamB?.score]);

  const primaryColor = theme?.primaryColor || '#e63946';
  const matchMinutes = data.matchTime?.minutes ?? 0;
  const matchSeconds = data.matchTime?.seconds ?? 0;
  const timeFormatted = `${String(matchMinutes).padStart(2, '0')}:${String(matchSeconds).padStart(2, '0')}`;
  const periodText = data.matchTime?.period || '1º TEMPO';
  const animClass = getBroadcastMotionClass(data.animation?.entryType);

  const teamAName = data.teamA?.shortName || data.teamA?.name || 'TIME A';
  const teamBName = data.teamB?.shortName || data.teamB?.name || 'TIME B';
  const scoreA = data.teamA?.score ?? 0;
  const scoreB = data.teamB?.score ?? 0;
  const colorA = data.teamA?.color || primaryColor;
  const colorB = data.teamB?.color || '#118ab2';

  const bottomPosition = isTickerActive ? 'bottom-[78px]' : 'bottom-[40px]';

  return (
    <div id="export-scoreboard" className="z-30 select-none pointer-events-none">
      {/* Layout 1: Compact Bug (Canto Superior Esquerdo - Padrão Notícias/TV) */}
      {(data.layout === 'compact-bug' || !data.layout) && (
        <div className="absolute top-[50px] left-[70px] z-30">
          <div className={`bg-[#090d16]/98 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 backdrop-blur-2xl broadcast-shimmer min-w-[280px] ${animClass}`}>
            {/* Header Time Bar */}
            <div className="bg-[#030509] px-4 py-1.5 flex items-center justify-between text-xs font-black text-slate-300 border-b border-white/15 font-condensed tracking-wider">
              <span className="text-yellow-400 font-mono text-sm font-black">{timeFormatted}</span>
              <span className="uppercase text-slate-400 font-bold">{periodText}</span>
            </div>

            {/* Teams & Scores */}
            <div className="flex flex-col divide-y divide-white/10">
              {/* Team A */}
              <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-[#0f1524]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-7 rounded-xs shadow-md flex-shrink-0" style={{ backgroundColor: colorA }} />
                  <span className="font-black text-2xl text-white tracking-wide font-condensed uppercase truncate max-w-[140px]">
                    {teamAName}
                  </span>
                  {data.teamA?.yellowCards !== undefined && data.teamA.yellowCards > 0 && (
                    <span className="w-3 h-4 bg-yellow-400 rounded-xs shadow flex-shrink-0" />
                  )}
                  {data.teamA?.redCards !== undefined && data.teamA.redCards > 0 && (
                    <span className="w-3 h-4 bg-red-600 rounded-xs shadow flex-shrink-0" />
                  )}
                </div>
                <span className={`text-2xl font-black text-yellow-400 bg-black/85 px-3.5 py-0.5 rounded font-mono shadow-inner min-w-[36px] text-center ${pulseScoreA ? 'animate-score-pulse text-white' : ''}`}>
                  {scoreA}
                </span>
              </div>

              {/* Team B */}
              <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-[#0c111e]">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-7 rounded-xs shadow-md flex-shrink-0" style={{ backgroundColor: colorB }} />
                  <span className="font-black text-2xl text-white tracking-wide font-condensed uppercase truncate max-w-[140px]">
                    {teamBName}
                  </span>
                  {data.teamB?.yellowCards !== undefined && data.teamB.yellowCards > 0 && (
                    <span className="w-3 h-4 bg-yellow-400 rounded-xs shadow flex-shrink-0" />
                  )}
                  {data.teamB?.redCards !== undefined && data.teamB.redCards > 0 && (
                    <span className="w-3 h-4 bg-red-600 rounded-xs shadow flex-shrink-0" />
                  )}
                </div>
                <span className={`text-2xl font-black text-yellow-400 bg-black/85 px-3.5 py-0.5 rounded font-mono shadow-inner min-w-[36px] text-center ${pulseScoreB ? 'animate-score-pulse text-white' : ''}`}>
                  {scoreB}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout 2: Bottom Bar (Barra Inferior ESPN / Fox Sports) */}
      {data.layout === 'bottom-bar' && (
        <div className={`absolute ${bottomPosition} left-1/2 -translate-x-1/2 z-30 transition-all duration-300`}>
          <div className={`flex items-center bg-[#070b14]/98 rounded-xl shadow-2xl border-2 border-white/20 overflow-hidden backdrop-blur-2xl broadcast-shimmer ${animClass}`}>
            {/* Time Block */}
            <div className="bg-[#030508] px-6 py-3.5 text-center border-r border-white/15">
              <div className="text-2xl font-black text-yellow-400 font-mono leading-none">{timeFormatted}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 font-condensed">{periodText}</div>
            </div>

            {/* Team A */}
            <div className="flex items-center gap-4 px-6 py-3.5">
              <span className="w-3.5 h-9 rounded shadow flex-shrink-0" style={{ backgroundColor: colorA }} />
              <span className="font-black text-3xl text-white tracking-wider font-condensed uppercase">
                {data.teamA?.name || teamAName}
              </span>
              <span className={`text-4xl font-black text-yellow-400 font-mono px-4 py-1 bg-black/85 rounded-md shadow min-w-[48px] text-center ${pulseScoreA ? 'animate-score-pulse text-white' : ''}`}>
                {scoreA}
              </span>
            </div>

            <div className="px-3 font-black text-slate-500 text-base">VS</div>

            {/* Team B */}
            <div className="flex items-center gap-4 px-6 py-3.5">
              <span className={`text-4xl font-black text-yellow-400 font-mono px-4 py-1 bg-black/85 rounded-md shadow min-w-[48px] text-center ${pulseScoreB ? 'animate-score-pulse text-white' : ''}`}>
                {scoreB}
              </span>
              <span className="font-black text-3xl text-white tracking-wider font-condensed uppercase">
                {data.teamB?.name || teamBName}
              </span>
              <span className="w-3.5 h-9 rounded shadow flex-shrink-0" style={{ backgroundColor: colorB }} />
            </div>
          </div>
        </div>
      )}

      {/* Layout 3: Top Center (Basquete / Vôlei Flutuante) */}
      {data.layout === 'top-center' && (
        <div className="absolute top-[45px] left-1/2 -translate-x-1/2 z-30">
          <div className={`flex items-center bg-[#090d18]/98 rounded-full px-8 py-2.5 shadow-2xl border-2 border-white/20 backdrop-blur-2xl broadcast-shimmer ${animClass}`}>
            <div className="flex items-center gap-3.5 pr-5 border-r border-white/15">
              <span className="w-3.5 h-3.5 rounded-full shadow" style={{ backgroundColor: colorA }} />
              <span className="font-black text-2xl text-white font-condensed uppercase">{teamAName}</span>
              <span className={`font-mono text-2xl font-black text-yellow-400 px-3 py-0.5 bg-black/75 rounded min-w-[36px] text-center ${pulseScoreA ? 'animate-score-pulse' : ''}`}>{scoreA}</span>
            </div>

            <div className="px-5 text-center">
              <div className="font-mono text-xl font-black text-white">{timeFormatted}</div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{periodText}</div>
            </div>

            <div className="flex items-center gap-3.5 pl-5 border-l border-white/15">
              <span className={`font-mono text-2xl font-black text-yellow-400 px-3 py-0.5 bg-black/75 rounded min-w-[36px] text-center ${pulseScoreB ? 'animate-score-pulse' : ''}`}>{scoreB}</span>
              <span className="font-black text-2xl text-white font-condensed uppercase">{teamBName}</span>
              <span className="w-3.5 h-3.5 rounded-full shadow" style={{ backgroundColor: colorB }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- TICKER RENDERER (Clean Auto-Fit Layout) ---
const TickerRenderer: React.FC<{ data: TickerData; theme: OverlayTheme; stationName: string }> = ({ 
  data, 
  theme, 
  stationName 
}) => {
  const primaryColor = theme?.primaryColor || '#e63946';
  const [staticIndex, setStaticIndex] = useState(0);

  useEffect(() => {
    if (data.isStaticBreaking && data.items && data.items.length > 1) {
      const interval = setInterval(() => {
        setStaticIndex((prev) => (prev + 1) % data.items.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data.isStaticBreaking, data.items]);

  const animClass = getBroadcastMotionClass(data.animation?.entryType);
  const headlineTitle = data.headlineTitle || stationName || 'ASTRO NOTÍCIAS';

  return (
    <div 
      id="export-ticker"
      className={`absolute bottom-0 left-0 right-0 w-full h-[64px] bg-[#070a12]/98 border-t-2 shadow-2xl flex items-center z-40 select-none backdrop-blur-2xl broadcast-shimmer ${animClass}`}
      style={{ borderTopColor: primaryColor }}
    >
      {/* Brand / Headline Badge (Fixed on Left with Auto-Fit Width & Dynamic Theme Border) */}
      <div 
        className="h-full px-6 flex items-center gap-2.5 font-black text-lg text-white tracking-wider uppercase flex-shrink-0 z-30 shadow-2xl font-condensed border-r-4"
        style={{ backgroundColor: primaryColor, borderRightColor: accentColor }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        <span className="whitespace-nowrap drop-shadow">{headlineTitle}</span>
      </div>

      {/* Subtle Gradient Mask to Smoothly Reveal Crawling News */}
      <div className="relative flex-1 h-full overflow-hidden flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#070a12] to-transparent z-20 pointer-events-none" />

        {/* Crawl Track or Static Breaking */}
        {data.isStaticBreaking ? (
          <div className="flex-1 px-8 flex items-center gap-4 overflow-hidden z-10 animate-headline-shutter key={staticIndex}">
            <span 
              className="px-3.5 py-1 text-xs font-black text-black rounded uppercase font-condensed shadow flex-shrink-0"
              style={{ backgroundColor: data.items[staticIndex]?.categoryColor || '#ffd166' }}
            >
              {data.items[staticIndex]?.category || 'URGENTE'}
            </span>
            <span className="text-xl lg:text-2xl font-bold text-white tracking-wide truncate uppercase">
              {data.items[staticIndex]?.text}
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden whitespace-nowrap z-10">
            <div 
              className="inline-flex items-center animate-ticker"
              style={{ animationDuration: `${data.speedSeconds || 25}s` }}
            >
              {[...(data.items || []), ...(data.items || [])].map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-3.5 mx-8 flex-shrink-0">
                  <span 
                    className="px-3 py-0.5 text-xs font-black text-black rounded uppercase tracking-wider font-condensed shadow-sm flex-shrink-0"
                    style={{ backgroundColor: item.categoryColor || '#ffd166' }}
                  >
                    {item.category}
                  </span>
                  <span className="text-2xl font-semibold text-slate-100 tracking-wide whitespace-nowrap">
                    {item.text}
                  </span>
                  <span className="text-red-500 font-black ml-4 text-base">✦</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- BUG / WATERMARK / CLOCK RENDERER ---
const BugRenderer: React.FC<{ data: BugData; theme: OverlayTheme; stationName: string; isTickerActive: boolean }> = ({ 
  data, 
  theme, 
  stationName,
  isTickerActive 
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('pt-BR', { hour12: data.clockFormat === '12h' }));
      setDateStr(now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [data.clockFormat]);

  const getPositionStyle = (): React.CSSProperties => {
    if (data.position === 'custom' && data.customX !== undefined && data.customY !== undefined) {
      return { left: `${data.customX}%`, top: `${data.customY}%` };
    }
    const bottomY = isTickerActive ? '80px' : '50px';
    switch (data.position) {
      case 'top-right': return { top: '50px', right: '70px' };
      case 'top-left': return { top: '50px', left: '70px' };
      case 'bottom-right': return { bottom: bottomY, right: '70px' };
      case 'bottom-left': return { bottom: bottomY, left: '70px' };
      default: return { top: '50px', right: '70px' };
    }
  };

  return (
    <div 
      id="export-bug"
      className="absolute flex flex-col items-end gap-2 z-20 select-none pointer-events-none transition-all duration-300 animate-fade-in"
      style={{
        ...getPositionStyle(),
        transform: `scale(${data.scale})`,
        transformOrigin: data.position.includes('right') ? 'top right' : 'top left',
        opacity: data.opacity,
      }}
    >
      {/* Live Badge */}
      {data.showLiveBadge && (
        <div className="flex items-center gap-2 bg-red-600 text-white font-black text-xs px-3 py-0.5 rounded shadow-lg uppercase tracking-widest font-condensed animate-pulse-fast">
          <span className="w-2 h-2 rounded-full bg-white" />
          {data.liveBadgeText || 'AO VIVO'}
        </div>
      )}

      {/* Logo */}
      {data.logoUrl ? (
        <img src={data.logoUrl} alt="Logo" className="h-12 object-contain drop-shadow-xl" />
      ) : (
        <div className="text-2xl font-black tracking-widest text-white drop-shadow-md font-condensed bg-black/40 px-3.5 py-1 rounded border border-white/15 backdrop-blur-md">
          {stationName}
        </div>
      )}

      {/* Clock */}
      {data.showClock && (
        <div className="bg-black/85 px-2.5 py-0.5 rounded text-xs font-mono font-bold text-yellow-400 border border-white/15 shadow-md">
          {timeStr} {data.showDate && `• ${dateStr}`}
        </div>
      )}
    </div>
  );
};

// --- COUNTDOWN RENDERER ---
const CountdownRenderer: React.FC<{ data: CountdownData; theme: OverlayTheme }> = ({ data, theme }) => {
  const primaryColor = theme?.primaryColor || '#e63946';
  const targetSec = data.targetSeconds ?? 0;
  const minutes = Math.floor(targetSec / 60);
  const seconds = targetSec % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const animClass = getBroadcastMotionClass(data.animation?.entryType);

  return (
    <div 
      id="export-countdown"
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 select-none text-center ${animClass}`}
    >
      <div 
        className="bg-[#0b0f1c]/98 border-2 border-white/20 border-t-8 rounded-3xl p-12 md:p-16 shadow-2xl backdrop-blur-2xl min-w-[650px] broadcast-shimmer"
        style={{ borderTopColor: primaryColor }}
      >
        <div className="text-xl md:text-2xl font-black text-white tracking-widest uppercase mb-4 font-condensed flex items-center justify-center gap-3">
          <Radio className="w-7 h-7 text-red-500 animate-pulse" />
          {data.title}
        </div>

        <div className="font-mono text-8xl md:text-9xl font-black text-yellow-400 tracking-wider my-4 drop-shadow-[0_0_40px_rgba(255,209,102,0.5)]">
          {timeFormatted}
        </div>

        <p className="text-xl font-semibold text-slate-300 tracking-wide mt-2">
          {data.subtitle}
        </p>
      </div>
    </div>
  );
};

// --- FULLSCREEN GRAPHIC RENDERER ---
const FullscreenRenderer: React.FC<{ data: FullscreenData; theme: OverlayTheme }> = ({ data, theme }) => {
  const primaryColor = data.customTheme?.primaryColor || theme?.primaryColor || '#e63946';
  const accentColor = data.customTheme?.accentColor || theme?.accentColor || '#ffd166';
  const animClass = getBroadcastMotionClass(data.animation?.entryType);

  return (
    <div 
      id="export-fullscreen"
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-16 select-none animate-fade-in"
    >
      <div 
        className={`w-full max-w-[1400px] bg-[#0c101d]/98 border border-white/15 rounded-3xl p-14 shadow-2xl relative overflow-hidden broadcast-shimmer ${animClass}`}
        style={{ borderTop: `10px solid ${primaryColor}` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span 
            className="px-3.5 py-1 text-sm font-black uppercase tracking-widest text-black rounded font-condensed shadow"
            style={{ backgroundColor: accentColor }}
          >
            {data.category}
          </span>
          <span className="text-sm font-bold text-slate-400 tracking-wider">ASTRO TV • GRÁFICO ESPECIAL</span>
        </div>

        <h1 className="text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight font-condensed mb-4 drop-shadow">
          {data.title}
        </h1>
        <p className="text-2xl font-medium text-slate-300 mb-8">
          {data.subtitle}
        </p>

        {/* Template: Stat Summary */}
        {data.template === 'stat-summary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mt-6">
            <div className="bg-black/60 p-8 rounded-2xl border border-white/10 text-center shadow-inner">
              <div className="text-9xl font-black text-yellow-400 font-mono leading-none drop-shadow">
                {data.statNumber}
              </div>
              <div className="text-xl font-bold text-slate-200 mt-4 uppercase tracking-wide">
                {data.statLabel}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4">
              {data.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 text-2xl font-bold text-white shadow-sm">
                  <span className="w-3.5 h-3.5 rounded-full shadow" style={{ backgroundColor: primaryColor }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Template: Schedule / Agenda */}
        {data.template === 'schedule-agenda' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {data.items?.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 shadow-sm">
                <span className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-cyan-400/40">
                  0{idx + 1}
                </span>
                <span className="text-2xl font-bold text-white leading-snug">
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Template: Big Quote */}
        {data.template === 'quote-card' && (
          <div className="bg-white/5 p-8 rounded-2xl border-l-8 border-yellow-400 mt-6 shadow-sm">
            <Quote className="w-14 h-14 text-yellow-400 mb-4 opacity-80" />
            <p className="text-3xl lg:text-4xl font-bold italic text-white leading-relaxed">
              "{data.title}"
            </p>
            {data.quoteAuthor && (
              <div className="mt-6 text-2xl font-bold text-yellow-400">
                — {data.quoteAuthor} <span className="text-slate-400 text-lg font-normal">({data.quoteAuthorRole})</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- TRANSITION / STINGER RENDERER ---
const TransitionRenderer: React.FC<{ transition: TransitionState; theme: OverlayTheme; stationName: string }> = ({
  transition,
  theme,
  stationName,
}) => {
  const primaryColor = theme?.primaryColor || '#e63946';
  const accentColor = theme?.accentColor || '#ffd166';

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* 1. Wipe Right */}
      {transition.type === 'wipe-right' && (
        <div 
          className="absolute inset-0 animate-wipe-left"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, #073b4c 100%)`,
            boxShadow: '0 0 100px rgba(0,0,0,0.8)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-7xl font-black tracking-widest text-white uppercase font-condensed drop-shadow-2xl">
              {stationName}
            </div>
          </div>
        </div>
      )}

      {/* 2. Blade Stinger */}
      {transition.type === 'blade-stinger' && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 animate-blade-sweep"
            style={{ background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})` }}
          />
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <div className="text-8xl font-black text-white font-condensed tracking-widest animate-elastic-snap">
              {stationName} LIVE
            </div>
          </div>
        </div>
      )}

      {/* 3. Glitch Cyber TV */}
      {transition.type === 'glitch-wipe' && (
        <div className="absolute inset-0 bg-[#080b12] flex items-center justify-center animate-glitch-tv">
          <div className="text-8xl font-black text-red-500 font-condensed tracking-widest drop-shadow-[0_0_30px_red]">
            /// {stationName} LIVE ///
          </div>
        </div>
      )}

      {/* 4. Zoom Blur Impact */}
      {transition.type === 'zoom-blur' && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-amber-500 flex items-center justify-center animate-scale-bounce">
          <div className="text-9xl font-black text-white font-condensed tracking-widest drop-shadow-2xl">
            {stationName}
          </div>
        </div>
      )}

      {/* 5. Shutter Split */}
      {transition.type === 'shutter-split' && (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1 bg-red-600 animate-slide-right" />
          <div className="flex-1 bg-[#073b4c] flex items-center justify-center animate-curtain-reveal">
            <span className="text-7xl font-black text-yellow-400 font-condensed tracking-widest">{stationName}</span>
          </div>
          <div className="flex-1 bg-red-600 animate-slide-left" />
        </div>
      )}

      {/* 6. Cyber Shockwave */}
      {transition.type === 'cyber-shockwave' && (
        <div className="absolute inset-0 bg-cyan-950/90 flex items-center justify-center animate-fade-in">
          <div className="w-[500px] h-[500px] rounded-full border-8 border-cyan-400 animate-ping absolute" />
          <div className="text-8xl font-black text-cyan-300 font-condensed tracking-widest relative z-10 animate-elastic-snap">
            {stationName}
          </div>
        </div>
      )}

      {/* 7. Circle Iris */}
      {transition.type === 'circle-iris' && (
        <div className="w-full h-full bg-red-600 rounded-full animate-scale-bounce flex items-center justify-center scale-150">
          <div className="text-8xl font-black text-white font-condensed">
            {stationName}
          </div>
        </div>
      )}

      {/* 8. Logo Stinger */}
      {transition.type === 'logo-stinger' && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c101a] via-red-950 to-[#073b4c] flex items-center justify-center animate-curtain-reveal">
          <div className="flex flex-col items-center animate-scale-bounce">
            <Flame className="w-24 h-24 text-amber-400 animate-pulse-fast mb-2" />
            <div className="text-7xl font-black text-white font-condensed tracking-widest">
              {stationName}
            </div>
            <div className="text-sm font-bold text-amber-300 tracking-widest uppercase mt-2">
              IMPRENSA ASTRO • TRANSMISSÃO AO VIVO
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
