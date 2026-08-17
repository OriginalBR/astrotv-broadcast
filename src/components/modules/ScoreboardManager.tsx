import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  Minus, 
  RotateCcw, 
  Clock, 
  Shield, 
  Trophy, 
  Download, 
  Copy, 
  Trash2, 
  Eye, 
  Sparkles, 
  Flag 
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { ScoreboardData, SportType, ScoreboardLayout } from '../../types/broadcast';
import { ExportModal } from '../modals/ExportModal';

export const ScoreboardManager: React.FC = () => {
  const {
    scoreboards,
    activeScoreboard,
    setScoreboardOnAir,
    addScoreboard,
    updateScoreboard,
    deleteScoreboard,
    duplicateScoreboard,
    incrementScore,
    toggleScoreboardTimer,
    resetScoreboardTimer,
    setScoreboardTime,
    setQueuedOverlay,
    savePreset,
  } = useBroadcastStore();

  const [selectedId, setSelectedId] = useState<string>(scoreboards[0]?.id || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<ScoreboardData | null>(null);

  const selectedItem = scoreboards.find((sb) => sb.id === selectedId) || scoreboards[0];

  const handleCreateNew = (sport: SportType = 'futsal') => {
    const newItem: ScoreboardData = {
      id: `sb-${Date.now()}`,
      name: `Novo Placar ${sport.toUpperCase()}`,
      sport,
      layout: sport === 'futsal' ? 'compact-bug' : sport === 'volleyball' ? 'bottom-bar' : 'top-center',
      teamA: {
        name: 'TIME CASA',
        shortName: 'CAS',
        score: 0,
        color: '#e63946',
        fouls: 0,
        yellowCards: 0,
        redCards: 0,
      },
      teamB: {
        name: 'TIME VISITANTE',
        shortName: 'VIS',
        score: 0,
        color: '#118ab2',
        fouls: 0,
        yellowCards: 0,
        redCards: 0,
      },
      matchTime: {
        minutes: 0,
        seconds: 0,
        isRunning: false,
        period: sport === 'volleyball' ? '1º SET' : sport === 'basketball' ? '1º QUARTO' : '1º TEMPO',
      },
      animation: {
        entryType: 'slide',
        exitType: 'slide',
        durationMs: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      isOnAir: false,
    };
    addScoreboard(newItem);
    setSelectedId(newItem.id);
  };

  const handleLiveTeamScore = (team: 'teamA' | 'teamB', delta: number) => {
    if (!selectedItem) return;
    const current = selectedItem[team].score;
    const updated = Math.max(0, current + delta);
    updateScoreboard(selectedItem.id, {
      [team]: {
        ...selectedItem[team],
        score: updated,
      },
    });
  };

  const handleLiveCard = (team: 'teamA' | 'teamB', type: 'yellow' | 'red') => {
    if (!selectedItem) return;
    const prop = type === 'yellow' ? 'yellowCards' : 'redCards';
    const current = selectedItem[team][prop] || 0;
    updateScoreboard(selectedItem.id, {
      [team]: {
        ...selectedItem[team],
        [prop]: (current + 1) % 3, // cycles 0 -> 1 -> 2 -> 0
      },
    });
  };

  const handleLiveFouls = (team: 'teamA' | 'teamB', delta: number) => {
    if (!selectedItem) return;
    const current = selectedItem[team].fouls || 0;
    updateScoreboard(selectedItem.id, {
      [team]: {
        ...selectedItem[team],
        fouls: Math.max(0, current + delta),
      },
    });
  };

  const periodsBySport: Record<SportType, string[]> = {
    futsal: ['1º TEMPO', 'INTERVALO', '2º TEMPO', 'PRORROGAÇÃO', 'PÊNALTIS', 'FIM DE JOGO'],
    volleyball: ['1º SET', '2º SET', '3º SET', '4º SET', 'TIE-BREAK', 'FIM DE JOGO'],
    basketball: ['1º QUARTO', '2º QUARTO', 'INTERVALO', '3º QUARTO', '4º QUARTO', 'OVERTIME', 'FIM'],
    generic: ['ROUND 1', 'ROUND 2', 'ROUND 3', 'FINAL', 'ENCERRADO'],
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
      {/* Col 1: Scoreboard Presets & Matches (4 cols) */}
      <div className="xl:col-span-4 bg-[#0e1320] border border-white/10 rounded-xl p-4 flex flex-col h-[820px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase font-condensed tracking-wider">
              Placares & Esportes
            </h2>
            <p className="text-xs text-slate-400">Gerenciador de partidas ao vivo</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleCreateNew('futsal')}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow"
              title="Novo Placar de Futsal / Futebol"
            >
              + Futsal
            </button>
            <button
              onClick={() => handleCreateNew('volleyball')}
              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow"
              title="Novo Placar de Vôlei"
            >
              + Vôlei
            </button>
            <button
              onClick={() => handleCreateNew('basketball')}
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow"
              title="Novo Placar de Basquete"
            >
              + Basquete
            </button>
          </div>
        </div>

        {/* List of Scoreboards */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {scoreboards.map((sb) => {
            const isOnAir = activeScoreboard?.id === sb.id;
            const isSelected = selectedItem?.id === sb.id;

            return (
              <div
                key={sb.id}
                onClick={() => setSelectedId(sb.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#182136] border-amber-500/80 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-[#121828] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnAir ? 'bg-amber-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-bold text-sm text-white truncate max-w-[180px]">
                      {sb.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-black/60 text-amber-400 font-mono px-2 py-0.5 rounded uppercase">
                    {sb.sport} • {sb.layout}
                  </span>
                </div>

                {/* Live Match Score Mini-Row */}
                <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded border border-white/5 font-condensed">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-4 rounded-xs" style={{ backgroundColor: sb.teamA.color }} />
                    <span className="font-bold text-sm text-white">{sb.teamA.shortName || sb.teamA.name}</span>
                  </div>
                  <div className="font-mono text-lg font-black text-yellow-400 px-2 py-0.5 bg-black/80 rounded">
                    {sb.teamA.score} - {sb.teamB.score}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{sb.teamB.shortName || sb.teamB.name}</span>
                    <span className="w-2 h-4 rounded-xs" style={{ backgroundColor: sb.teamB.color }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    ⏱ {String(sb.matchTime.minutes).padStart(2, '0')}:{String(sb.matchTime.seconds).padStart(2, '0')}
                  </span>
                  <span>{sb.matchTime.period}</span>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  <div className="flex items-center gap-1.5">
                    {isOnAir ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setScoreboardOnAir(null);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-black rounded text-xs font-black uppercase tracking-wider shadow"
                      >
                        <Square className="w-3 h-3" /> NO AR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setScoreboardOnAir(sb.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[#1f2b48] hover:bg-amber-600 hover:text-black text-slate-200 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Play className="w-3 h-3" /> COLOCAR NO AR
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueuedOverlay('scoreboard', sb);
                      }}
                      title="Enviar para Fila de Preview"
                      className="p-1.5 bg-[#161d2d] hover:bg-emerald-600 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExportTarget(sb);
                        setIsExportModalOpen(true);
                      }}
                      title="Exportar Placar"
                      className="p-1.5 bg-[#161d2d] hover:bg-blue-600 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateScoreboard(sb.id);
                      }}
                      title="Duplicar"
                      className="p-1.5 bg-[#161d2d] hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir placar "${sb.name}"?`)) {
                          deleteScoreboard(sb.id);
                        }
                      }}
                      title="Excluir"
                      className="p-1.5 bg-[#161d2d] hover:bg-red-900 text-slate-300 hover:text-red-200 rounded text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Col 2: Live Match Cockpit & Scoreboard Settings (8 cols) */}
      {selectedItem ? (
        <div className="xl:col-span-8 bg-[#0e1320] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-[820px] overflow-y-auto">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-condensed">
                    Mesa de Operação do Placar ({selectedItem.sport.toUpperCase()})
                  </h3>
                  <p className="text-xs text-slate-400">Controles em tempo real sem reacionar o overlay</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    savePreset('scoreboard', selectedItem.name, selectedItem);
                    alert('Placar salvo como preset!');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a233a] hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-white/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Salvar Preset
                </button>
                <button
                  onClick={() => {
                    setExportTarget(selectedItem);
                    setIsExportModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Overlay
                </button>
              </div>
            </div>

            {/* LIVE SCOREBOARD COCKPIT (Huge Live Score Adjuster) */}
            <div className="bg-[#121828] border border-white/10 rounded-xl p-5 mb-6 shadow-2xl">
              <div className="text-xs font-black uppercase text-amber-400 tracking-wider mb-4 flex items-center justify-between">
                <span>Painel de Operação Rápida ao Vivo</span>
                <span className="text-[10px] text-slate-400">Teclas A / B para +1 Ponto</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                {/* Team A Live Controls (5 cols) */}
                <div className="md:col-span-5 bg-[#090d18] p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedItem.teamA.color}
                      onChange={(e) =>
                        updateScoreboard(selectedItem.id, {
                          teamA: { ...selectedItem.teamA, color: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedItem.teamA.name}
                      onChange={(e) =>
                        updateScoreboard(selectedItem.id, {
                          teamA: { ...selectedItem.teamA, name: e.target.value },
                        })
                      }
                      className="bg-transparent text-white font-black text-xl font-condensed uppercase flex-1 border-b border-transparent hover:border-slate-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Score Counter & Quick Increments */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Pontos</span>
                      <span className="font-mono text-6xl font-black text-yellow-400 leading-none my-1">
                        {selectedItem.teamA.score}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLiveTeamScore('teamA', 1)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-black text-sm shadow"
                        >
                          +1 GOL/PTO
                        </button>
                        {selectedItem.sport === 'basketball' && (
                          <>
                            <button
                              onClick={() => handleLiveTeamScore('teamA', 2)}
                              className="px-2 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded font-black text-xs"
                            >
                              +2
                            </button>
                            <button
                              onClick={() => handleLiveTeamScore('teamA', 3)}
                              className="px-2 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded font-black text-xs"
                            >
                              +3
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleLiveTeamScore('teamA', -1)}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-sm"
                        >
                          -1
                        </button>
                      </div>

                      {/* Fouls & Cards for Team A */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleLiveFouls('teamA', 1)}
                          className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold"
                        >
                          Faltas: {selectedItem.teamA.fouls || 0} (+)
                        </button>
                        <button
                          onClick={() => handleLiveCard('teamA', 'yellow')}
                          className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded font-bold"
                        >
                          🟨 {selectedItem.teamA.yellowCards || 0}
                        </button>
                        <button
                          onClick={() => handleLiveCard('teamA', 'red')}
                          className="text-[10px] px-1.5 py-0.5 bg-red-600/20 text-red-300 border border-red-500/40 rounded font-bold"
                        >
                          🟥 {selectedItem.teamA.redCards || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Clock & Period (1 col center) */}
                <div className="md:col-span-1 flex flex-col items-center justify-center gap-2">
                  <div className="text-center">
                    <div className="font-mono text-2xl font-black text-white bg-black/80 px-2 py-1 rounded border border-white/10">
                      {String(selectedItem.matchTime.minutes).padStart(2, '0')}:
                      {String(selectedItem.matchTime.seconds).padStart(2, '0')}
                    </div>
                  </div>

                  <button
                    onClick={toggleScoreboardTimer}
                    className={`w-full py-1.5 rounded text-xs font-black uppercase transition-all shadow ${
                      selectedItem.matchTime.isRunning
                        ? 'bg-amber-500 text-black animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {selectedItem.matchTime.isRunning ? 'Pausar' : 'Iniciar'}
                  </button>

                  <button
                    onClick={resetScoreboardTimer}
                    title="Zerar Cronômetro"
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Team B Live Controls (5 cols) */}
                <div className="md:col-span-5 bg-[#090d18] p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="flex items-center justify-end gap-3">
                    <input
                      type="text"
                      value={selectedItem.teamB.name}
                      onChange={(e) =>
                        updateScoreboard(selectedItem.id, {
                          teamB: { ...selectedItem.teamB, name: e.target.value },
                        })
                      }
                      className="bg-transparent text-white font-black text-xl font-condensed uppercase text-right flex-1 border-b border-transparent hover:border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="color"
                      value={selectedItem.teamB.color}
                      onChange={(e) =>
                        updateScoreboard(selectedItem.id, {
                          teamB: { ...selectedItem.teamB, color: e.target.value },
                        })
                      }
                      className="w-6 h-6 rounded border-0 cursor-pointer"
                    />
                  </div>

                  {/* Score Counter & Quick Increments */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleLiveTeamScore('teamB', -1)}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-sm"
                        >
                          -1
                        </button>
                        {selectedItem.sport === 'basketball' && (
                          <>
                            <button
                              onClick={() => handleLiveTeamScore('teamB', 3)}
                              className="px-2 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded font-black text-xs"
                            >
                              +3
                            </button>
                            <button
                              onClick={() => handleLiveTeamScore('teamB', 2)}
                              className="px-2 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded font-black text-xs"
                            >
                              +2
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleLiveTeamScore('teamB', 1)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-black text-sm shadow"
                        >
                          +1 GOL/PTO
                        </button>
                      </div>

                      {/* Fouls & Cards for Team B */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleLiveCard('teamB', 'red')}
                          className="text-[10px] px-1.5 py-0.5 bg-red-600/20 text-red-300 border border-red-500/40 rounded font-bold"
                        >
                          🟥 {selectedItem.teamB.redCards || 0}
                        </button>
                        <button
                          onClick={() => handleLiveCard('teamB', 'yellow')}
                          className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded font-bold"
                        >
                          🟨 {selectedItem.teamB.yellowCards || 0}
                        </button>
                        <button
                          onClick={() => handleLiveFouls('teamB', 1)}
                          className="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold"
                        >
                          Faltas: {selectedItem.teamB.fouls || 0} (+)
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Pontos</span>
                      <span className="font-mono text-6xl font-black text-yellow-400 leading-none my-1">
                        {selectedItem.teamB.score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoreboard Settings & Templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Layout Template */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Layout do Placar
                </label>
                <select
                  value={selectedItem.layout}
                  onChange={(e) =>
                    updateScoreboard(selectedItem.id, { layout: e.target.value as ScoreboardLayout })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="compact-bug">Canto Superior Esquerdo (Estilo TV Notícias)</option>
                  <option value="bottom-bar">Barra Inferior Completa (Estilo ESPN)</option>
                  <option value="top-center">Topo Central Flutuante (Estilo Basquete/Vôlei)</option>
                </select>
              </div>

              {/* Match Period */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Período da Partida
                </label>
                <select
                  value={selectedItem.matchTime.period}
                  onChange={(e) =>
                    updateScoreboard(selectedItem.id, {
                      matchTime: { ...selectedItem.matchTime, period: e.target.value },
                    })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                >
                  {periodsBySport[selectedItem.sport]?.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Adjustment Manual */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Ajustar Minutos / Segundos
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={selectedItem.matchTime.minutes}
                    onChange={(e) =>
                      updateScoreboard(selectedItem.id, {
                        matchTime: {
                          ...selectedItem.matchTime,
                          minutes: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-1/2 bg-[#141b2d] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={selectedItem.matchTime.seconds}
                    onChange={(e) =>
                      updateScoreboard(selectedItem.id, {
                        matchTime: {
                          ...selectedItem.matchTime,
                          seconds: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-1/2 bg-[#141b2d] border border-white/10 rounded px-2 py-1.5 text-xs text-white font-mono"
                    placeholder="Seg"
                  />
                </div>
              </div>

              {/* Animation Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Efeito de Entrada do Placar
                </label>
                <select
                  value={selectedItem.animation?.entryType || 'slide'}
                  onChange={(e) =>
                    updateScoreboard(selectedItem.id, {
                      animation: {
                        ...(selectedItem.animation || { durationMs: 400, exitType: 'slide', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }),
                        entryType: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="blade-sweep">Blade Sweep (ESPN / Sportv)</option>
                  <option value="elastic-snap">Elastic Snap (Impacto Rápido)</option>
                  <option value="curtain-reveal">Curtain Reveal (Split Wipe)</option>
                  <option value="scale-bounce">Scale Bounce Dinâmico</option>
                  <option value="flip-unfold">3D Flip Unfold</option>
                  <option value="slide">Slide Padrão</option>
                  <option value="wipe">Wipe Linear</option>
                  <option value="fade">Fade Suave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom On-Air Trigger */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status atual:</span>
              <span
                className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  activeScoreboard?.id === selectedItem.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeScoreboard?.id === selectedItem.id ? 'AO VIVO NO AR' : 'FORA DO AR'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQueuedOverlay('scoreboard', selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Colocar na Fila (Preview)
              </button>

              {activeScoreboard?.id === selectedItem.id ? (
                <button
                  onClick={() => setScoreboardOnAir(null)}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-black rounded-lg text-sm font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Square className="w-4 h-4" />
                  TIRAR DO AR
                </button>
              ) : (
                <button
                  onClick={() => setScoreboardOnAir(selectedItem.id)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Play className="w-4 h-4" />
                  COLOCAR NO AR AGORA
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        category="scoreboard"
        selectedItem={exportTarget}
      />
    </div>
  );
};
