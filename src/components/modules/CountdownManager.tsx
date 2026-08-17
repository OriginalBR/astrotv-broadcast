import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  RotateCcw, 
  Download, 
  Eye, 
  Sparkles, 
  Clock, 
  Trash2, 
  Sliders 
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { CountdownData } from '../../types/broadcast';
import { ExportModal } from '../modals/ExportModal';

export const CountdownManager: React.FC = () => {
  const {
    countdowns,
    activeCountdown,
    setCountdownOnAir,
    addCountdown,
    updateCountdown,
    deleteCountdown,
    toggleCountdownTimer,
    resetCountdownTimer,
    setQueuedOverlay,
    savePreset,
  } = useBroadcastStore();

  const [selectedId, setSelectedId] = useState<string>(countdowns[0]?.id || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<CountdownData | null>(null);

  const selectedItem = countdowns.find((cd) => cd.id === selectedId) || countdowns[0];

  const handleCreateNew = (minutes: number = 5) => {
    const totalSec = minutes * 60;
    const newItem: CountdownData = {
      id: `cd-${Date.now()}`,
      name: `Contagem ${minutes} Minutos`,
      targetSeconds: totalSec,
      initialDurationSeconds: totalSec,
      isRunning: false,
      title: 'A TRANSMISSÃO COMEÇARÁ EM',
      subtitle: 'Prepare sua torcida • Cobertura ao vivo AstroTv',
      autoAction: 'stinger',
      animation: {
        entryType: 'scale-bounce',
        exitType: 'fade',
        durationMs: 450,
        easing: 'ease-out',
      },
      isOnAir: false,
    };
    addCountdown(newItem);
    setSelectedId(newItem.id);
  };

  const handleAdjustDuration = (deltaMinutes: number) => {
    if (!selectedItem) return;
    const newTotal = Math.max(10, selectedItem.initialDurationSeconds + deltaMinutes * 60);
    updateCountdown(selectedItem.id, {
      initialDurationSeconds: newTotal,
      targetSeconds: newTotal,
      isRunning: false,
    });
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
      {/* Col 1: Countdown Presets (4 cols) */}
      <div className="xl:col-span-4 bg-[#0e1320] border border-white/10 rounded-xl p-4 flex flex-col h-[780px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase font-condensed tracking-wider">
              Contagens Regressivas
            </h2>
            <p className="text-xs text-slate-400">Início de transmissão e intervalos</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCreateNew(5)}
              className="px-2 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow"
            >
              + 5 min
            </button>
            <button
              onClick={() => handleCreateNew(2)}
              className="px-2 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
            >
              + 2 min
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {countdowns.map((cd) => {
            const isOnAir = activeCountdown?.id === cd.id;
            const isSelected = selectedItem?.id === cd.id;
            const min = Math.floor(cd.targetSeconds / 60);
            const sec = cd.targetSeconds % 60;

            return (
              <div
                key={cd.id}
                onClick={() => setSelectedId(cd.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#182136] border-purple-500/80 shadow-md ring-1 ring-purple-500/50'
                    : 'bg-[#121828] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnAir ? 'bg-purple-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-bold text-sm text-white truncate max-w-[180px]">
                      {cd.name}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-black text-yellow-400 bg-black/60 px-2 py-0.5 rounded">
                    {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-semibold truncate">
                  {cd.title}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  <div className="flex items-center gap-1.5">
                    {isOnAir ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCountdownOnAir(null);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-black uppercase tracking-wider shadow"
                      >
                        <Square className="w-3 h-3" /> NO AR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCountdownOnAir(cd.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[#1f2b48] hover:bg-purple-600 text-slate-200 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Play className="w-3 h-3" /> COLOCAR NO AR
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueuedOverlay('countdown', cd);
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
                        setExportTarget(cd);
                        setIsExportModalOpen(true);
                      }}
                      title="Exportar"
                      className="p-1.5 bg-[#161d2d] hover:bg-blue-600 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir "${cd.name}"?`)) {
                          deleteCountdown(cd.id);
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

      {/* Col 2: Countdown Cockpit (8 cols) */}
      {selectedItem ? (
        <div className="xl:col-span-8 bg-[#0e1320] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-[780px] overflow-y-auto">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-condensed">
                    Mesa de Controle da Contagem Regressiva
                  </h3>
                  <p className="text-xs text-slate-400">Ajuste o tempo, mensagens e ação ao zerar</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    savePreset('countdown', selectedItem.name, selectedItem);
                    alert('Contagem salva como preset!');
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

            {/* Giant Live Timer Cockpit */}
            <div className="bg-[#121828] border border-white/10 rounded-xl p-8 mb-6 text-center shadow-2xl flex flex-col items-center justify-center">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 font-condensed">
                {selectedItem.title}
              </div>

              <div className="font-mono text-8xl font-black text-yellow-400 tracking-wider my-3 drop-shadow-[0_0_25px_rgba(255,209,102,0.3)]">
                {String(Math.floor(selectedItem.targetSeconds / 60)).padStart(2, '0')}:
                {String(selectedItem.targetSeconds % 60).padStart(2, '0')}
              </div>

              <div className="text-sm text-slate-400 mb-6">
                {selectedItem.subtitle}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleCountdownTimer}
                  className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition-all ${
                    selectedItem.isRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-black animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {selectedItem.isRunning ? 'Pausar Contagem' : 'Iniciar Contagem'}
                </button>

                <button
                  onClick={resetCountdownTimer}
                  className="flex items-center gap-1.5 px-4 py-3 bg-[#1a233a] hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar
                </button>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleAdjustDuration(1)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded"
                  >
                    +1 Min
                  </button>
                  <button
                    onClick={() => handleAdjustDuration(5)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded"
                  >
                    +5 Min
                  </button>
                  <button
                    onClick={() => handleAdjustDuration(-1)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded"
                  >
                    -1 Min
                  </button>
                </div>
              </div>
            </div>

            {/* Customizer Settings Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Título Superior
                </label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => updateCountdown(selectedItem.id, { title: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-purple-500 uppercase font-condensed"
                  placeholder="EX: A TRANSMISSÃO COMEÇARÁ EM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mensagem Secundária Inferior
                </label>
                <input
                  type="text"
                  value={selectedItem.subtitle}
                  onChange={(e) => updateCountdown(selectedItem.id, { subtitle: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-purple-500"
                  placeholder="EX: Prepare sua torcida • AstroTv"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Ação Automática ao Chegar a Zero
                </label>
                <select
                  value={selectedItem.autoAction}
                  onChange={(e) =>
                    updateCountdown(selectedItem.id, {
                      autoAction: e.target.value as CountdownData['autoAction'],
                    })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="none">Nenhuma (Permanece em 00:00)</option>
                  <option value="hide">Ocultar Overlay Automaticamente</option>
                  <option value="stinger">Disparar Vinheta de Transição Imediata</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Duração Inicial Manual (Segundos)
                </label>
                <input
                  type="number"
                  min="10"
                  max="7200"
                  value={selectedItem.initialDurationSeconds}
                  onChange={(e) => {
                    const sec = parseInt(e.target.value) || 60;
                    updateCountdown(selectedItem.id, {
                      initialDurationSeconds: sec,
                      targetSeconds: sec,
                    });
                  }}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bottom On-Air Trigger */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status atual:</span>
              <span
                className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  activeCountdown?.id === selectedItem.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeCountdown?.id === selectedItem.id ? 'AO VIVO NO AR' : 'FORA DO AR'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQueuedOverlay('countdown', selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Colocar na Fila (Preview)
              </button>

              {activeCountdown?.id === selectedItem.id ? (
                <button
                  onClick={() => setCountdownOnAir(null)}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Square className="w-4 h-4" />
                  TIRAR DO AR
                </button>
              ) : (
                <button
                  onClick={() => setCountdownOnAir(selectedItem.id)}
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
        category="countdown"
        selectedItem={exportTarget}
      />
    </div>
  );
};
