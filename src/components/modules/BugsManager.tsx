import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Download, 
  Eye, 
  Sparkles, 
  Clock, 
  Radio, 
  Upload, 
  Sliders, 
  Layers 
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { BugData, BugPosition } from '../../types/broadcast';
import { ExportModal } from '../modals/ExportModal';

export const BugsManager: React.FC = () => {
  const {
    bugs,
    activeBug,
    setBugOnAir,
    addBug,
    updateBug,
    deleteBug,
    setQueuedOverlay,
    savePreset,
  } = useBroadcastStore();

  const [selectedId, setSelectedId] = useState<string>(bugs[0]?.id || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<BugData | null>(null);

  const selectedItem = bugs.find((bg) => bg.id === selectedId) || bugs[0];

  const handleCreateNew = () => {
    const newItem: BugData = {
      id: `bg-${Date.now()}`,
      name: 'Novo Logo / Marca d\'Água',
      logoUrl: '',
      position: 'top-right',
      scale: 1.0,
      opacity: 0.95,
      showLiveBadge: true,
      liveBadgeText: 'AO VIVO',
      showClock: true,
      clockFormat: '24h',
      showDate: false,
      isOnAir: false,
    };
    addBug(newItem);
    setSelectedId(newItem.id);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedItem) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateBug(selectedItem.id, { logoUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const positions: { id: BugPosition; label: string }[] = [
    { id: 'top-right', label: 'Canto Superior Direito' },
    { id: 'top-left', label: 'Canto Superior Esquerdo' },
    { id: 'bottom-right', label: 'Canto Inferior Direito' },
    { id: 'bottom-left', label: 'Canto Inferior Esquerdo' },
    { id: 'custom', label: 'Posição Personalizada (X / Y)' },
  ];

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
      {/* Col 1: Bugs List (4 cols) */}
      <div className="xl:col-span-4 bg-[#0e1320] border border-white/10 rounded-xl p-4 flex flex-col h-[780px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase font-condensed tracking-wider">
              Bugs, Logos & Relógio
            </h2>
            <p className="text-xs text-slate-400">Marcas d'água de transmissão</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo
          </button>
        </div>

        {/* List of Bugs */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {bugs.map((bg) => {
            const isOnAir = activeBug?.id === bg.id;
            const isSelected = selectedItem?.id === bg.id;

            return (
              <div
                key={bg.id}
                onClick={() => setSelectedId(bg.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#182136] border-red-500/80 shadow-md ring-1 ring-red-500/50'
                    : 'bg-[#121828] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnAir ? 'bg-red-500 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-bold text-sm text-white truncate max-w-[180px]">
                      {bg.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-black/60 text-slate-400 font-mono px-2 py-0.5 rounded uppercase">
                    {bg.position}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  {bg.showLiveBadge && (
                    <span className="px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded font-bold">
                      {bg.liveBadgeText}
                    </span>
                  )}
                  {bg.showClock && (
                    <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-300 rounded font-mono font-bold">
                      Relógio {bg.clockFormat}
                    </span>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  <div className="flex items-center gap-1.5">
                    {isOnAir ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBugOnAir(null);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-black uppercase tracking-wider shadow"
                      >
                        <Square className="w-3 h-3" /> NO AR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBugOnAir(bg.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[#1f2b48] hover:bg-red-600 text-slate-200 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Play className="w-3 h-3" /> COLOCAR NO AR
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueuedOverlay('bug', bg);
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
                        setExportTarget(bg);
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
                        if (confirm(`Excluir "${bg.name}"?`)) {
                          deleteBug(bg.id);
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

      {/* Col 2: Bug & Watermark Customizer (8 cols) */}
      {selectedItem ? (
        <div className="xl:col-span-8 bg-[#0e1320] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-[780px] overflow-y-auto">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-condensed">
                    Configuração de Logo, Selo Ao Vivo & Relógio
                  </h3>
                  <p className="text-xs text-slate-400">Posicionamento e elementos de canto de tela</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    savePreset('bug', selectedItem.name, selectedItem);
                    alert('Bug salvo como preset!');
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

            {/* Position and Scale Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Preset Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome do Elemento
                </label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => updateBug(selectedItem.id, { name: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Position Selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Posição na Tela
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {positions.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => updateBug(selectedItem.id, { position: pos.id })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedItem.position === pos.id
                          ? 'bg-red-600/20 border-red-500 text-white shadow ring-1 ring-red-500'
                          : 'bg-[#141b2d] border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs">{pos.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Sliders if custom */}
              {selectedItem.position === 'custom' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Posição Horizontal X ({selectedItem.customX || 50}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedItem.customX || 50}
                      onChange={(e) =>
                        updateBug(selectedItem.id, { customX: Number(e.target.value) })
                      }
                      className="w-full accent-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Posição Vertical Y ({selectedItem.customY || 50}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedItem.customY || 50}
                      onChange={(e) =>
                        updateBug(selectedItem.id, { customY: Number(e.target.value) })
                      }
                      className="w-full accent-red-500"
                    />
                  </div>
                </>
              )}

              {/* Scale & Opacity */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tamanho / Escala ({Math.round(selectedItem.scale * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={selectedItem.scale}
                  onChange={(e) =>
                    updateBug(selectedItem.id, { scale: Number(e.target.value) })
                  }
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Opacidade / Transparência ({Math.round(selectedItem.opacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={selectedItem.opacity}
                  onChange={(e) =>
                    updateBug(selectedItem.id, { opacity: Number(e.target.value) })
                  }
                  className="w-full accent-red-500"
                />
              </div>

              {/* Logo Upload */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Logo / Imagem da TV (PNG com Transparência)
                </label>
                <div className="flex items-center gap-4 bg-[#141b2d] p-3 rounded-lg border border-white/10">
                  {selectedItem.logoUrl ? (
                    <img
                      src={selectedItem.logoUrl}
                      alt="Logo"
                      className="h-10 max-w-[120px] object-contain bg-black/40 p-1 rounded"
                    />
                  ) : (
                    <div className="px-3 py-1 bg-black/50 text-xs text-white font-bold rounded">
                      Texto Padrão (ASTRO TV)
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      Enviar Arquivo do Logo (PNG / SVG)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
                  {selectedItem.logoUrl && (
                    <button
                      onClick={() => updateBug(selectedItem.id, { logoUrl: '' })}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remover Logo
                    </button>
                  )}
                </div>
              </div>

              {/* Live Badge Toggle */}
              <div className="bg-[#141b2d] p-4 rounded-lg border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold text-white uppercase">
                      Selo "Ao Vivo" Animado
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItem.showLiveBadge}
                    onChange={(e) =>
                      updateBug(selectedItem.id, { showLiveBadge: e.target.checked })
                    }
                    className="w-4 h-4 accent-red-500"
                  />
                </div>
                {selectedItem.showLiveBadge && (
                  <input
                    type="text"
                    value={selectedItem.liveBadgeText}
                    onChange={(e) =>
                      updateBug(selectedItem.id, { liveBadgeText: e.target.value })
                    }
                    className="w-full bg-[#0c101a] border border-white/10 rounded px-2 py-1 text-xs text-white uppercase font-bold"
                    placeholder="Texto do Selo (Ex: AO VIVO, GRAVADO)"
                  />
                )}
              </div>

              {/* Clock & Date Toggle */}
              <div className="bg-[#141b2d] p-4 rounded-lg border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-white uppercase">
                      Relógio em Tempo Real
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItem.showClock}
                    onChange={(e) =>
                      updateBug(selectedItem.id, { showClock: e.target.checked })
                    }
                    className="w-4 h-4 accent-yellow-500"
                  />
                </div>
                {selectedItem.showClock && (
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedItem.clockFormat}
                      onChange={(e) =>
                        updateBug(selectedItem.id, { clockFormat: e.target.value as '24h' | '12h' })
                      }
                      className="bg-[#0c101a] border border-white/10 rounded px-2 py-1 text-xs text-white"
                    >
                      <option value="24h">Formato 24h (Brasília)</option>
                      <option value="12h">Formato 12h (AM/PM)</option>
                    </select>

                    <label className="flex items-center gap-1.5 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedItem.showDate}
                        onChange={(e) =>
                          updateBug(selectedItem.id, { showDate: e.target.checked })
                        }
                        className="accent-yellow-500"
                      />
                      Exibir Data
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom On-Air Trigger */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status atual:</span>
              <span
                className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  activeBug?.id === selectedItem.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeBug?.id === selectedItem.id ? 'AO VIVO NO AR' : 'FORA DO AR'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQueuedOverlay('bug', selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Colocar na Fila (Preview)
              </button>

              {activeBug?.id === selectedItem.id ? (
                <button
                  onClick={() => setBugOnAir(null)}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Square className="w-4 h-4" />
                  TIRAR DO AR
                </button>
              ) : (
                <button
                  onClick={() => setBugOnAir(selectedItem.id)}
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
        category="bug"
        selectedItem={exportTarget}
      />
    </div>
  );
};
