import React, { useState, useEffect } from 'react';
import { useBroadcastStore } from './store/useBroadcastStore';
import { Navbar } from './components/layout/Navbar';
import { LivePreviewBar } from './components/layout/LivePreviewBar';
import { OutputCanvas } from './components/canvas/OutputCanvas';
import { LowerThirdsManager } from './components/modules/LowerThirdsManager';
import { ScoreboardManager } from './components/modules/ScoreboardManager';
import { TickerManager } from './components/modules/TickerManager';
import { BugsManager } from './components/modules/BugsManager';
import { CountdownManager } from './components/modules/CountdownManager';
import { TransitionsManager } from './components/modules/TransitionsManager';
import { FullscreenManager } from './components/modules/FullscreenManager';
import { ThemeAndPresetsManager } from './components/modules/ThemeAndPresetsManager';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { 
  User, 
  Trophy, 
  Sliders, 
  Radio, 
  Clock, 
  Sparkles, 
  LayoutTemplate, 
  Palette,
  AlertTriangle
} from 'lucide-react';

type TabType = 
  | 'lowerThirds' 
  | 'scoreboards' 
  | 'tickers' 
  | 'bugs' 
  | 'countdowns' 
  | 'transitions' 
  | 'fullscreens' 
  | 'theme';

export function App() {
  // Check if current route is standalone output for OBS
  const isOutputRoute = window.location.pathname === '/output' || window.location.hash === '#/output';

  const {
    activeLowerThird,
    activeScoreboard,
    activeTicker,
    activeBug,
    activeCountdown,
    activeFullscreen,
    setLowerThirdOnAir,
    setScoreboardOnAir,
    setTickerOnAir,
    setBugOnAir,
    setCountdownOnAir,
    setFullscreenOnAir,
    triggerTransition,
    clearAllOverlays,
    toggleScoreboardTimer,
    incrementScore,
    lowerThirds,
    scoreboards,
    tickers,
    bugs,
    countdowns,
    fullscreens,
  } = useBroadcastStore();

  const [activeTab, setActiveTab] = useState<TabType>('lowerThirds');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        clearAllOverlays();
      } else if (e.code === 'Space') {
        e.preventDefault();
        triggerTransition('wipe-right', 'whoosh', 450);
      } else if (e.key === '1') {
        if (activeLowerThird) setLowerThirdOnAir(null);
        else if (lowerThirds[0]) setLowerThirdOnAir(lowerThirds[0].id);
      } else if (e.key === '2') {
        if (activeScoreboard) setScoreboardOnAir(null);
        else if (scoreboards[0]) setScoreboardOnAir(scoreboards[0].id);
      } else if (e.key === '3') {
        if (activeTicker) setTickerOnAir(null);
        else if (tickers[0]) setTickerOnAir(tickers[0].id);
      } else if (e.key === '4') {
        if (activeBug) setBugOnAir(null);
        else if (bugs[0]) setBugOnAir(bugs[0].id);
      } else if (e.key === '5') {
        if (activeCountdown) setCountdownOnAir(null);
        else if (countdowns[0]) setCountdownOnAir(countdowns[0].id);
      } else if (e.key === '6') {
        if (activeFullscreen) setFullscreenOnAir(null);
        else if (fullscreens[0]) setFullscreenOnAir(fullscreens[0].id);
      } else if (e.key === 'p' || e.key === 'P') {
        toggleScoreboardTimer();
      } else if (e.key === 'a' || e.key === 'A') {
        incrementScore('teamA', 1);
      } else if (e.key === 'b' || e.key === 'B') {
        incrementScore('teamB', 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeLowerThird,
    activeScoreboard,
    activeTicker,
    activeBug,
    activeCountdown,
    activeFullscreen,
    lowerThirds,
    scoreboards,
    tickers,
    bugs,
    countdowns,
    fullscreens,
    setLowerThirdOnAir,
    setScoreboardOnAir,
    setTickerOnAir,
    setBugOnAir,
    setCountdownOnAir,
    setFullscreenOnAir,
    triggerTransition,
    clearAllOverlays,
    toggleScoreboardTimer,
    incrementScore,
  ]);

  // If in Standalone Output Route (for OBS Studio)
  if (isOutputRoute) {
    return <OutputCanvas isStandaloneWindow={true} />;
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; isOnAir?: boolean }[] = [
    { 
      id: 'lowerThirds', 
      label: 'Lower Thirds', 
      icon: <User className="w-4 h-4" />, 
      badge: lowerThirds.length,
      isOnAir: !!activeLowerThird 
    },
    { 
      id: 'scoreboards', 
      label: 'Placares', 
      icon: <Trophy className="w-4 h-4" />, 
      badge: scoreboards.length,
      isOnAir: !!activeScoreboard 
    },
    { 
      id: 'tickers', 
      label: 'Ticker (Notícias)', 
      icon: <Sliders className="w-4 h-4" />, 
      badge: tickers.length,
      isOnAir: !!activeTicker 
    },
    { 
      id: 'bugs', 
      label: 'Bugs & Logos', 
      icon: <Radio className="w-4 h-4" />, 
      badge: bugs.length,
      isOnAir: !!activeBug 
    },
    { 
      id: 'countdowns', 
      label: 'Contagem Regressiva', 
      icon: <Clock className="w-4 h-4" />, 
      badge: countdowns.length,
      isOnAir: !!activeCountdown 
    },
    { 
      id: 'transitions', 
      label: 'Vinhetas & Transições', 
      icon: <Sparkles className="w-4 h-4 text-amber-400" /> 
    },
    { 
      id: 'fullscreens', 
      label: 'Tela Cheia (Slides)', 
      icon: <LayoutTemplate className="w-4 h-4" />, 
      badge: fullscreens.length,
      isOnAir: !!activeFullscreen 
    },
    { 
      id: 'theme', 
      label: 'Personalização & Presets', 
      icon: <Palette className="w-4 h-4 text-cyan-400" /> 
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans">
      {/* Master Navbar */}
      <Navbar
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenTheme={() => setActiveTab('theme')}
      />

      {/* Live Preview Monitor Bar */}
      <LivePreviewBar />

      {/* Module Navigation Tabs */}
      <nav className="bg-[#0e1320] border-b border-white/10 px-6 overflow-x-auto flex items-center gap-1 select-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-red-500 text-white bg-[#141b2d]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#121826]'
            }`}
          >
            <span className={tab.isOnAir ? 'text-red-500 animate-pulse' : ''}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>

            {tab.isOnAir && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}

            {tab.badge !== undefined && (
              <span className="text-[10px] bg-black/40 text-slate-400 font-mono px-1.5 py-0.2 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Main Workspace Active Module */}
      <main className="flex-1 bg-[#0a0d14]">
        {activeTab === 'lowerThirds' && <LowerThirdsManager />}
        {activeTab === 'scoreboards' && <ScoreboardManager />}
        {activeTab === 'tickers' && <TickerManager />}
        {activeTab === 'bugs' && <BugsManager />}
        {activeTab === 'countdowns' && <CountdownManager />}
        {activeTab === 'transitions' && <TransitionsManager />}
        {activeTab === 'fullscreens' && <FullscreenManager />}
        {activeTab === 'theme' && <ThemeAndPresetsManager />}
      </main>

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
