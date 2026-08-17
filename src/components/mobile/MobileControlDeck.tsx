import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  User, 
  Sparkles, 
  Radio, 
  Tv, 
  Play, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  AlertOctagon, 
  Wifi, 
  WifiOff, 
  Sliders, 
  Clock, 
  Plus, 
  Minus,
  Maximize2,
  Eye,
  Monitor
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { RenderOverlay } from '../canvas/RenderOverlay';
import { broadcastBus, ConnectionStatus } from '../../utils/broadcastSync';

interface MobileControlDeckProps {
  onSwitchToDesktop?: () => void;
}

type MobileTab = 'preview' | 'scoreboard' | 'lowerThirds' | 'transitions' | 'ticker';

export const MobileControlDeck: React.FC<MobileControlDeckProps> = ({ onSwitchToDesktop }) => {
  const {
    activeLowerThird,
    activeScoreboard,
    activeTicker,
    activeBug,
    activeCountdown,
    activeFullscreen,
    activeTransition,
    brandTheme,
    stationName,
    isBlackout,
    audioMuted,
    lowerThirds,
    scoreboards,
    tickers,
    bugs,
    setLowerThirdOnAir,
    setScoreboardOnAir,
    setTickerOnAir,
    setBugOnAir,
    triggerTransition,
    incrementScore,
    toggleScoreboardTimer,
    toggleAudioMute,
    clearAllOverlays,
    updateScoreboard,
  } = useBroadcastStore();

  const [activeTab, setActiveTab] = useState<MobileTab>('scoreboard');
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('connecting');
  const [clientCount, setClientCount] = useState<number>(1);
  const [isLandscape, setIsLandscape] = useState(false);

  // References and dynamic scale calculation for pixel-perfect preview
  const previewBoxRef = useRef<HTMLDivElement>(null);
  const fullPreviewRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.18);
  const [fullScale, setFullScale] = useState(0.35);

  // Calculate dynamic scale whenever screen resizes or orientation changes
  useEffect(() => {
    const updateScales = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);

      // Mini preview scale
      if (previewBoxRef.current) {
        const rect = previewBoxRef.current.getBoundingClientRect();
        const scaleW = rect.width / 1920;
        const scaleH = rect.height / 1080;
        setPreviewScale(Math.min(scaleW, scaleH) * 0.96);
      }

      // Full preview tab scale
      if (fullPreviewRef.current) {
        const rect = fullPreviewRef.current.getBoundingClientRect();
        const scaleW = rect.width / 1920;
        const scaleH = rect.height / 1080;
        setFullScale(Math.min(scaleW, scaleH) * 0.98);
      }
    };

    updateScales();
    const timeout = setTimeout(updateScales, 300);
    window.addEventListener('resize', updateScales);
    window.addEventListener('orientationchange', updateScales);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateScales);
      window.removeEventListener('orientationchange', updateScales);
    };
  }, [activeTab, isLandscape]);

  // WebSocket connection status listener
  useEffect(() => {
    const unsubscribe = broadcastBus.subscribeStatus((status, count) => {
      setWsStatus(status);
      setClientCount(count);
    });
    return () => unsubscribe();
  }, []);

  const currentSb = activeScoreboard || scoreboards[0];
  const isSbOnAir = !!activeScoreboard;
  const isAnyOnAir = !!activeLowerThird || !!activeScoreboard || !!activeTicker || !!activeBug || !!activeCountdown || !!activeFullscreen;

  const timeFormatted = currentSb 
    ? `${String(currentSb.matchTime.minutes).padStart(2, '0')}:${String(currentSb.matchTime.seconds).padStart(2, '0')}`
    : '00:00';

  const handleResetTimer = () => {
    if (currentSb) {
      updateScoreboard(currentSb.id, {
        matchTime: { ...currentSb.matchTime, minutes: 0, seconds: 0, isRunning: false },
      });
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#070a12] text-white flex flex-col overflow-hidden select-none touch-manipulation font-sans">
      {/* 1. Header Bar (Status & Emergency Blackout) */}
      <header className="h-11 bg-[#0c101a] border-b border-white/10 px-3 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-slate-900 px-2 py-0.5 rounded-lg shadow text-xs font-black font-condensed tracking-wider uppercase border border-red-500/40">
            <img src="/logo.png" alt="Logo" className="w-4 h-4 rounded object-contain ring-1 ring-yellow-400/50" />
            <span>{stationName}</span>
          </div>

          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            wsStatus === 'connected' 
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' 
              : 'bg-amber-950 text-amber-400 border border-amber-500/40'
          }`}>
            {wsStatus === 'connected' ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
            <span>{wsStatus === 'connected' ? 'OBS OK' : 'Reconectando'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudioMute}
            className={`p-1.5 rounded-md border text-xs ${
              audioMuted ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-[#161d2d] text-slate-300 border-white/10'
            }`}
          >
            {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={clearAllOverlays}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-900/90 active:bg-red-800 text-red-100 rounded-md text-[11px] font-black uppercase border border-red-600/50 shadow"
          >
            <AlertOctagon className="w-3 h-3 text-red-400" />
            <span>LIMPAR</span>
          </button>
        </div>
      </header>

      {/* 2. Main Stage (Auto-Adapts to Tab Selection & Orientation) */}
      
      {/* FULL PREVIEW TAB MODE (Tela cheia de Monitor) */}
      {activeTab === 'preview' ? (
        <div ref={fullPreviewRef} className="flex-1 w-full p-3 flex items-center justify-center relative overflow-hidden bg-black bg-studio-grid">
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-white/15 text-xs font-black uppercase font-condensed">
            <span className={`w-2.5 h-2.5 rounded-full ${isAnyOnAir ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
            <span className={isAnyOnAir ? 'text-red-400' : 'text-slate-400'}>
              {isAnyOnAir ? 'PROGRAM AO VIVO (1920×1080)' : 'STANDBY (PRONTO)'}
            </span>
          </div>

          <div 
            style={{
              width: '1920px',
              height: '1080px',
              transform: `scale(${fullScale})`,
              transformOrigin: 'center center',
            }}
            className="pointer-events-none shadow-2xl border-4 border-white/10 rounded-xl overflow-hidden"
          >
            <RenderOverlay
              lowerThird={activeLowerThird}
              scoreboard={activeScoreboard}
              ticker={activeTicker}
              bug={activeBug}
              countdown={activeCountdown}
              fullscreen={activeFullscreen}
              transition={activeTransition}
              theme={brandTheme}
              stationName={stationName}
              isBlackout={isBlackout}
            />
          </div>
        </div>
      ) : (
        /* STANDARD DUAL CONTROLLER VIEW (Mini Preview + Dynamic Touch Deck) */
        <div className={`flex-1 flex overflow-hidden ${isLandscape ? 'flex-row' : 'flex-col'}`}>
          
          {/* Top/Left PGM Live Monitor Miniature Box */}
          <div className={`${
            isLandscape 
              ? 'w-[44%] h-full border-r border-white/10 p-2 flex flex-col justify-between' 
              : 'h-[32%] w-full p-2 flex-shrink-0'
          }`}>
            <div 
              ref={previewBoxRef}
              className="relative w-full h-full bg-[#03060c] rounded-lg border-2 border-red-500/60 overflow-hidden shadow-xl flex items-center justify-center bg-studio-grid"
            >
              {/* Live Status Pill */}
              <div className="absolute top-1.5 left-2 z-40 flex items-center gap-1.5 bg-black/85 backdrop-blur px-2 py-0.5 rounded text-[10px] font-black uppercase font-condensed border border-white/10">
                <span className={`w-2 h-2 rounded-full ${isAnyOnAir ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
                <span className={isAnyOnAir ? 'text-red-400' : 'text-slate-400'}>
                  {isAnyOnAir ? 'AO VIVO' : 'STANDBY'}
                </span>
              </div>

              {/* Tap to Fullscreen Monitor Button */}
              <button
                onClick={() => setActiveTab('preview')}
                className="absolute top-1.5 right-2 z-40 bg-black/70 hover:bg-slate-800 p-1 rounded text-slate-300 border border-white/10"
                title="Expandir Preview em Tela Cheia"
              >
                <Maximize2 className="w-3 h-3" />
              </button>

              {/* Dynamically Scaled Program Canvas */}
              <div 
                style={{
                  width: '1920px',
                  height: '1080px',
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'center center',
                  position: 'absolute',
                }}
                className="pointer-events-none"
              >
                <RenderOverlay
                  lowerThird={activeLowerThird}
                  scoreboard={activeScoreboard}
                  ticker={activeTicker}
                  bug={activeBug}
                  countdown={activeCountdown}
                  fullscreen={activeFullscreen}
                  transition={activeTransition}
                  theme={brandTheme}
                  stationName={stationName}
                  isBlackout={isBlackout}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Touch Controls Deck (Zero Scroll) */}
          <div className={`flex-1 flex flex-col justify-between p-2.5 overflow-hidden ${isLandscape ? 'w-[56%]' : 'w-full'}`}>
            
            {/* TAB: PLACAR AO VIVO (SCOREBOARD PAD) */}
            {activeTab === 'scoreboard' && currentSb && (
              <div className="flex-1 flex flex-col justify-between gap-2 h-full">
                {/* Teams & Scores Big Touch Pad */}
                <div className="grid grid-cols-2 gap-2 flex-1 items-stretch">
                  {/* Team A */}
                  <div className="bg-[#0e1422] border border-white/10 rounded-xl p-2 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-4 rounded-xs shadow" style={{ backgroundColor: currentSb.teamA.color }} />
                        <span className="font-black text-xs text-white font-condensed uppercase truncate max-w-[85px]">
                          {currentSb.teamA.shortName || currentSb.teamA.name}
                        </span>
                      </div>
                      <button
                        onClick={() => incrementScore('teamA', -1)}
                        className="w-6 h-6 bg-slate-800 active:bg-slate-700 text-slate-300 rounded flex items-center justify-center text-xs font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => incrementScore('teamA', 1)}
                      className="flex-1 my-1 bg-gradient-to-b from-[#162035] to-[#101828] active:from-amber-600 active:to-amber-700 rounded-lg flex flex-col items-center justify-center shadow-inner border border-white/5"
                    >
                      <span className="font-mono text-5xl font-black text-yellow-400 leading-none">
                        {currentSb.teamA.score}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider">
                        +1 PONTO / GOL
                      </span>
                    </button>
                  </div>

                  {/* Team B */}
                  <div className="bg-[#0e1422] border border-white/10 rounded-xl p-2 flex flex-col justify-between shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-4 rounded-xs shadow" style={{ backgroundColor: currentSb.teamB.color }} />
                        <span className="font-black text-xs text-white font-condensed uppercase truncate max-w-[85px]">
                          {currentSb.teamB.shortName || currentSb.teamB.name}
                        </span>
                      </div>
                      <button
                        onClick={() => incrementScore('teamB', -1)}
                        className="w-6 h-6 bg-slate-800 active:bg-slate-700 text-slate-300 rounded flex items-center justify-center text-xs font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => incrementScore('teamB', 1)}
                      className="flex-1 my-1 bg-gradient-to-b from-[#162035] to-[#101828] active:from-amber-600 active:to-amber-700 rounded-lg flex flex-col items-center justify-center shadow-inner border border-white/5"
                    >
                      <span className="font-mono text-5xl font-black text-yellow-400 leading-none">
                        {currentSb.teamB.score}
                      </span>
                      <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider">
                        +1 PONTO / GOL
                      </span>
                    </button>
                  </div>
                </div>

                {/* Match Clock & On-Air Action Row */}
                <div className="flex items-center gap-2 h-13 flex-shrink-0">
                  <button
                    onClick={toggleScoreboardTimer}
                    className={`flex-1 h-full rounded-xl flex items-center justify-center gap-2 font-black text-sm uppercase font-condensed shadow-lg border transition-all ${
                      currentSb.matchTime.isRunning
                        ? 'bg-amber-600 active:bg-amber-700 text-black border-amber-400 animate-pulse'
                        : 'bg-[#151c2e] active:bg-slate-700 text-white border-white/10'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-mono text-lg">{timeFormatted}</span>
                    <span className="text-xs">{currentSb.matchTime.isRunning ? 'PAUSAR' : 'INICIAR'}</span>
                  </button>

                  <button
                    onClick={handleResetTimer}
                    title="Zerar Cronômetro"
                    className="w-11 h-full bg-[#111726] active:bg-slate-700 rounded-xl border border-white/10 flex items-center justify-center text-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setScoreboardOnAir(isSbOnAir ? null : currentSb.id)}
                    className={`px-3.5 h-full rounded-xl flex items-center justify-center gap-1 font-black text-xs uppercase font-condensed shadow-lg transition-all ${
                      isSbOnAir
                        ? 'bg-amber-500 active:bg-amber-600 text-black border-2 border-amber-300'
                        : 'bg-emerald-600 active:bg-emerald-700 text-white border-2 border-emerald-400'
                    }`}
                  >
                    {isSbOnAir ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isSbOnAir ? 'NO AR' : 'COLOCAR AR'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: TARJAS (LOWER THIRDS QUICK PAD) */}
            {activeTab === 'lowerThirds' && (
              <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto max-h-full">
                {lowerThirds.map((lt) => {
                  const isOnAir = activeLowerThird?.id === lt.id;
                  return (
                    <button
                      key={lt.id}
                      onClick={() => setLowerThirdOnAir(isOnAir ? null : lt.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all shadow ${
                        isOnAir
                          ? 'bg-red-950/90 border-red-500 text-white ring-2 ring-red-500/50'
                          : 'bg-[#0f1524] border-white/10 text-slate-200 active:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-black/60 text-yellow-400 font-condensed">
                          {lt.tag || 'GC'}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${isOnAir ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
                      </div>
                      <span className="font-bold text-xs uppercase font-condensed leading-snug line-clamp-2">
                        {lt.title}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate mt-1">
                        {lt.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB: VINHETAS & TRANSIÇÕES */}
            {activeTab === 'transitions' && (
              <div className="flex-1 grid grid-cols-2 gap-2 h-full items-stretch">
                <button
                  onClick={() => triggerTransition('wipe-right', 'whoosh', 450)}
                  className="bg-gradient-to-br from-red-700 to-amber-600 active:scale-95 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-lg border border-red-400/40"
                >
                  <Sparkles className="w-6 h-6 text-yellow-300 mb-1" />
                  <span className="font-black text-sm uppercase font-condensed tracking-wider">WIPE ESPORTE</span>
                  <span className="text-[9px] text-red-100 opacity-80">Corte Rápido</span>
                </button>

                <button
                  onClick={() => triggerTransition('blade-stinger', 'stinger', 500)}
                  className="bg-gradient-to-br from-blue-700 to-cyan-600 active:scale-95 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-lg border border-blue-400/40"
                >
                  <Tv className="w-6 h-6 text-cyan-200 mb-1" />
                  <span className="font-black text-sm uppercase font-condensed tracking-wider">BLADE STINGER</span>
                  <span className="text-[9px] text-blue-100 opacity-80">Lâmina Dupla</span>
                </button>

                <button
                  onClick={() => triggerTransition('glitch-wipe', 'glitch', 450)}
                  className="bg-gradient-to-br from-purple-800 to-pink-600 active:scale-95 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-lg border border-purple-400/40"
                >
                  <Radio className="w-6 h-6 text-pink-200 mb-1" />
                  <span className="font-black text-sm uppercase font-condensed tracking-wider">GLITCH TV</span>
                  <span className="text-[9px] text-purple-100 opacity-80">Ruído Cyber</span>
                </button>

                <button
                  onClick={() => triggerTransition('zoom-blur', 'stinger', 450)}
                  className="bg-gradient-to-br from-emerald-700 to-teal-600 active:scale-95 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-lg border border-emerald-400/40"
                >
                  <Sparkles className="w-6 h-6 text-emerald-200 mb-1" />
                  <span className="font-black text-sm uppercase font-condensed tracking-wider">ZOOM IMPACT</span>
                  <span className="text-[9px] text-emerald-100 opacity-80">Explosão de Logo</span>
                </button>
              </div>
            )}

            {/* TAB: TICKER & LOGOS */}
            {activeTab === 'ticker' && (
              <div className="flex-1 flex flex-col justify-between gap-2 h-full">
                <div className="bg-[#0e1422] border border-white/10 rounded-xl p-3 flex items-center justify-between shadow">
                  <div>
                    <span className="text-xs font-black uppercase text-white font-condensed block">
                      LETREIRO DE NOTÍCIAS (TICKER)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {activeTicker ? 'Ativo na base da transmissão' : 'Fora do ar'}
                    </span>
                  </div>
                  <button
                    onClick={() => setTickerOnAir(activeTicker ? null : tickers[0]?.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider font-condensed shadow ${
                      activeTicker ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {activeTicker ? 'NO AR' : 'LIGAR TICKER'}
                  </button>
                </div>

                <div className="bg-[#0e1422] border border-white/10 rounded-xl p-3 flex items-center justify-between shadow">
                  <div>
                    <span className="text-xs font-black uppercase text-white font-condensed block">
                      MARCA D'ÁGUA & SELO "AO VIVO"
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {activeBug ? 'Exibindo no canto da tela' : 'Oculto'}
                    </span>
                  </div>
                  <button
                    onClick={() => setBugOnAir(activeBug ? null : bugs[0]?.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider font-condensed shadow ${
                      activeBug ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {activeBug ? 'NO AR' : 'LIGAR LOGO'}
                  </button>
                </div>

                {onSwitchToDesktop && (
                  <button
                    onClick={onSwitchToDesktop}
                    className="w-full py-2 bg-[#162035] active:bg-slate-700 text-slate-200 rounded-xl border border-white/10 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Alternar para Modo Mesa Desktop</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Fixed Native Bottom Navigation Bar (Including PREVIEW Tab) */}
      <nav className="h-16 bg-[#090d16] border-t border-white/10 grid grid-cols-5 px-1 z-30 flex-shrink-0">
        {/* Tab: Preview Monitor */}
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'preview' ? 'text-cyan-400 bg-white/5 font-bold' : 'text-slate-400 active:text-white'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider font-condensed">PREVIEW</span>
        </button>

        {/* Tab: Placar */}
        <button
          onClick={() => setActiveTab('scoreboard')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'scoreboard' ? 'text-amber-400 bg-white/5 font-bold' : 'text-slate-400 active:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider font-condensed">PLACAR</span>
        </button>

        {/* Tab: Tarjas */}
        <button
          onClick={() => setActiveTab('lowerThirds')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'lowerThirds' ? 'text-red-400 bg-white/5 font-bold' : 'text-slate-400 active:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider font-condensed">TARJAS GC</span>
        </button>

        {/* Tab: Vinhetas */}
        <button
          onClick={() => setActiveTab('transitions')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'transitions' ? 'text-yellow-400 bg-white/5 font-bold' : 'text-slate-400 active:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider font-condensed">VINHETAS</span>
        </button>

        {/* Tab: Ticker & Logos */}
        <button
          onClick={() => setActiveTab('ticker')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${
            activeTab === 'ticker' ? 'text-blue-400 bg-white/5 font-bold' : 'text-slate-400 active:text-white'
          }`}
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-wider font-condensed">TICKER</span>
        </button>
      </nav>
    </div>
  );
};
