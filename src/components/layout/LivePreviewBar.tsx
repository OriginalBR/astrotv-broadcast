import React from 'react';
import { 
  Play, 
  Square, 
  ArrowRightLeft, 
  Radio, 
  Eye, 
  Layers, 
  Sparkles,
  Scissors,
  Zap,
  Trash2
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { OutputCanvas } from '../canvas/OutputCanvas';
import { RenderOverlay } from '../canvas/RenderOverlay';

export const LivePreviewBar: React.FC = () => {
  const {
    activeLowerThird,
    activeScoreboard,
    activeTicker,
    activeBug,
    activeCountdown,
    activeFullscreen,
    queuedOverlay,
    brandTheme,
    stationName,
    isBlackout,
    setQueuedOverlay,
    executeTransitionToQueued,
    triggerTransition,
    setLowerThirdOnAir,
    setScoreboardOnAir,
    setTickerOnAir,
    setBugOnAir,
    setCountdownOnAir,
    setFullscreenOnAir,
  } = useBroadcastStore();

  const activeCount = [
    activeLowerThird,
    activeScoreboard,
    activeTicker,
    activeBug,
    activeCountdown,
    activeFullscreen,
  ].filter(Boolean).length;

  return (
    <div className="bg-[#0e1320] border-b border-white/10 px-6 py-3 flex flex-col lg:flex-row items-center justify-between gap-4 select-none">
      {/* Dual Monitors: Preview (PVW) & Program (PGM) */}
      <div className="flex items-center gap-4 w-full lg:w-auto">
        {/* Preview (PVW / Staging) Monitor */}
        <div className="flex flex-col gap-1 flex-1 lg:flex-initial">
          <div className="flex items-center justify-between text-[11px] font-black tracking-wider uppercase">
            <span className="text-emerald-400 flex items-center gap-1">
              <Eye className="w-3 h-3" /> PVW (PREVIEW / FILA)
            </span>
            {queuedOverlay && (
              <button 
                onClick={() => setQueuedOverlay('lowerThird', null)}
                className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
              >
                Limpar Fila
              </button>
            )}
          </div>
          <div className="w-full lg:w-64 h-36 bg-black rounded-lg border-2 border-emerald-500/40 relative overflow-hidden shadow-lg flex items-center justify-center">
            {queuedOverlay ? (
              <div className="w-full h-full transform scale-[0.33] origin-top-left pointer-events-none" style={{ width: '300%', height: '300%' }}>
                <RenderOverlay
                  lowerThird={queuedOverlay.category === 'lowerThird' ? queuedOverlay.data : null}
                  scoreboard={queuedOverlay.category === 'scoreboard' ? queuedOverlay.data : null}
                  ticker={queuedOverlay.category === 'ticker' ? queuedOverlay.data : null}
                  bug={queuedOverlay.category === 'bug' ? queuedOverlay.data : null}
                  countdown={queuedOverlay.category === 'countdown' ? queuedOverlay.data : null}
                  fullscreen={queuedOverlay.category === 'fullscreen' ? queuedOverlay.data : null}
                  theme={brandTheme}
                  stationName={stationName}
                />
              </div>
            ) : (
              <div className="text-[11px] font-bold text-slate-600 text-center px-4">
                Nenhum overlay na fila de transição
              </div>
            )}
          </div>
        </div>

        {/* Master Switcher Controls */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={executeTransitionToQueued}
            disabled={!queuedOverlay}
            title="Executar transição suave do Preview para o Ar"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>TAKE / TRANSIÇÃO</span>
          </button>

          <button
            onClick={() => triggerTransition('wipe-right', 'whoosh', 400)}
            title="Disparar Vinheta de Transição Imediata"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a233a] hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-bold border border-white/10 transition-colors w-full justify-center"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>VINHETA RÁPIDA</span>
          </button>
        </div>

        {/* Program (PGM / Live) Live Monitor */}
        <div className="flex flex-col gap-1 flex-1 lg:flex-initial">
          <div className="flex items-center justify-between text-[11px] font-black tracking-wider uppercase">
            <span className="text-red-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> PGM (PROGRAM / AO VIVO)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1920×1080 @ 60FPS</span>
          </div>
          <div className="w-full lg:w-64 h-36 bg-[#070a12] rounded-lg border-2 border-red-500/80 relative overflow-hidden shadow-[0_0_20px_rgba(230,57,70,0.3)]">
            <div className="w-full h-full transform scale-[0.33] origin-top-left pointer-events-none" style={{ width: '300%', height: '300%' }}>
              <OutputCanvas isStandaloneWindow={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Active Overlays Quick-Bar & Off-Air Chips */}
      <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-1.5">
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
          Overlays Ativos no Ar ({activeCount}):
        </div>
        <div className="flex flex-wrap gap-2">
          {activeLowerThird && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 border border-red-500/40 text-red-200 rounded-md text-xs font-bold shadow">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LT: {activeLowerThird.title}</span>
              <button 
                onClick={() => setLowerThirdOnAir(null)}
                className="ml-1 hover:text-white"
                title="Tirar do Ar"
              >
                ✕
              </button>
            </div>
          )}

          {activeScoreboard && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 border border-amber-500/40 text-amber-200 rounded-md text-xs font-bold shadow">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>PLACAR: {activeScoreboard.teamA.score} x {activeScoreboard.teamB.score}</span>
              <button 
                onClick={() => setScoreboardOnAir(null)}
                className="ml-1 hover:text-white"
                title="Tirar do Ar"
              >
                ✕
              </button>
            </div>
          )}

          {activeTicker && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-950/80 border border-blue-500/40 text-blue-200 rounded-md text-xs font-bold shadow">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>TICKER: {activeTicker.headlineTitle || 'Notícias'}</span>
              <button 
                onClick={() => setTickerOnAir(null)}
                className="ml-1 hover:text-white"
                title="Tirar do Ar"
              >
                ✕
              </button>
            </div>
          )}

          {activeBug && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded-md text-xs font-bold shadow">
              <span>BUG/LOGO</span>
              <button 
                onClick={() => setBugOnAir(null)}
                className="ml-1 hover:text-white"
                title="Tirar do Ar"
              >
                ✕
              </button>
            </div>
          )}

          {activeCountdown && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/80 border border-purple-500/40 text-purple-200 rounded-md text-xs font-bold shadow">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>CONTAGEM: {Math.floor(activeCountdown.targetSeconds / 60)}m</span>
              <button 
                onClick={() => setCountdownOnAir(null)}
                className="ml-1 hover:text-white"
                title="Tirar do Ar"
              >
                ✕
              </button>
            </div>
          )}

          {activeFullscreen && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 rounded-md text-xs font-bold shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TELA CHEIA: {activeFullscreen.title}</span>
              <button 
                onClick={() => setFullscreenOnAir(null)}
                className="ml-1 hover:text-white"
                title="Tirar do Ar"
              >
                ✕
              </button>
            </div>
          )}

          {activeCount === 0 && (
            <div className="text-xs text-slate-500 italic">
              Nenhum overlay ativo na tela de transmissão.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
