import React, { useEffect, useState } from 'react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { RenderOverlay } from './RenderOverlay';
import { broadcastBus, BroadcastMessage } from '../../utils/broadcastSync';

interface OutputCanvasProps {
  isStandaloneWindow?: boolean;
}

export const OutputCanvas: React.FC<OutputCanvasProps> = ({ isStandaloneWindow = false }) => {
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
    tickCountdown,
    updateScoreboard,
    syncStateFromBroadcast,
  } = useBroadcastStore();

  const [wsConnected, setWsConnected] = useState(false);

  // Request initial broadcast state when OBS Browser Source boots up
  useEffect(() => {
    broadcastBus.send('REQUEST_CURRENT_STATE', { client: 'OBS_BROWSER_SOURCE' });

    const unsubscribeStatus = broadcastBus.subscribeStatus((status) => {
      setWsConnected(status === 'connected');
    });

    const unsubscribeMsg = broadcastBus.subscribe((msg: BroadcastMessage) => {
      if (msg.type === 'STATE_SYNC' && msg.payload) {
        syncStateFromBroadcast(msg.payload);
      } else if (msg.type === 'TRIGGER_TRANSITION' && msg.payload) {
        syncStateFromBroadcast({ activeTransition: msg.payload });
      } else if (msg.type === 'BLACKOUT_TOGGLE' && msg.payload) {
        syncStateFromBroadcast({ isBlackout: msg.payload.isBlackout });
      } else if (msg.type === 'UPDATE_SCORE' && msg.payload) {
        const currentSb = useBroadcastStore.getState().activeScoreboard;
        if (currentSb) {
          updateScoreboard(currentSb.id, {
            teamA: { ...currentSb.teamA, score: msg.payload.scoreA },
            teamB: { ...currentSb.teamB, score: msg.payload.scoreB },
          });
        }
      }
    });

    // Fallback: listen to localStorage event if any
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'astrotv_bus_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.type === 'STATE_SYNC') syncStateFromBroadcast(parsed.payload);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeStatus();
      unsubscribeMsg();
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncStateFromBroadcast, updateScoreboard]);

  // Real-time Countdown Timer Engine
  useEffect(() => {
    if (!activeCountdown || !activeCountdown.isRunning) return;
    const interval = setInterval(() => {
      tickCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCountdown, tickCountdown]);

  // Real-time Scoreboard Match Clock Engine
  useEffect(() => {
    if (!activeScoreboard || !activeScoreboard.matchTime.isRunning) return;
    const interval = setInterval(() => {
      const current = useBroadcastStore.getState().activeScoreboard;
      if (!current || !current.matchTime.isRunning) return;

      let { minutes, seconds } = current.matchTime;
      seconds += 1;
      if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
      }
      updateScoreboard(current.id, {
        matchTime: {
          ...current.matchTime,
          minutes,
          seconds,
        },
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeScoreboard, updateScoreboard]);

  return (
    <div 
      id="astro-output-stage"
      className={`relative overflow-hidden ${
        isStandaloneWindow 
          ? 'w-screen h-screen bg-transparent' 
          : 'w-full h-full bg-studio-grid'
      }`}
      style={{
        width: isStandaloneWindow ? '1920px' : '100%',
        height: isStandaloneWindow ? '1080px' : '100%',
      }}
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
  );
};
