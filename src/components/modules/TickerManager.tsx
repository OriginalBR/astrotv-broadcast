import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Copy, 
  Eye, 
  Sparkles, 
  Sliders, 
  Radio, 
  AlertTriangle 
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { TickerData, TickerItem } from '../../types/broadcast';
import { ExportModal } from '../modals/ExportModal';

export const TickerManager: React.FC = () => {
  const {
    tickers,
    activeTicker,
    setTickerOnAir,
    addTicker,
    updateTicker,
    deleteTicker,
    addTickerItem,
    removeTickerItem,
    updateTickerItem,
    reorderTickerItems,
    setQueuedOverlay,
    savePreset,
  } = useBroadcastStore();

  const [selectedId, setSelectedId] = useState<string>(tickers[0]?.id || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<TickerData | null>(null);

  const selectedItem = tickers.find((tk) => tk.id === selectedId) || tickers[0];

  const handleCreateNew = (isBreaking: boolean = false) => {
    const newItem: TickerData = {
      id: `tk-${Date.now()}`,
      name: isBreaking ? 'Plantão de Última Hora' : 'Novo Ticker de Notícias',
      speedSeconds: isBreaking ? 15 : 25,
      direction: 'left',
      isStaticBreaking: isBreaking,
      headlineTitle: isBreaking ? 'PLANTÃO URGENTE' : 'ASTRO NOTÍCIAS',
      items: [
        {
          id: `t-${Date.now()}-1`,
          category: isBreaking ? 'URGENTE' : 'NOTÍCIAS',
          categoryColor: isBreaking ? '#e63946' : '#ffd166',
          text: 'Digite a manchete principal que passará no letreiro da transmissão',
        },
      ],
      animation: {
        entryType: isBreaking ? 'glitch-in' : 'slide',
        exitType: 'slide',
        durationMs: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      isOnAir: false,
    };
    addTicker(newItem);
    setSelectedId(newItem.id);
  };

  const handleAddNewItem = () => {
    if (!selectedItem) return;
    const item: TickerItem = {
      id: `t-${Date.now()}`,
      category: 'GERAL',
      categoryColor: '#06d6a0',
      text: 'Nova manchete ou comunicado da escola...',
    };
    addTickerItem(selectedItem.id, item);
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
      {/* Col 1: Ticker Presets (4 cols) */}
      <div className="xl:col-span-4 bg-[#0e1320] border border-white/10 rounded-xl p-4 flex flex-col h-[780px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase font-condensed tracking-wider">
              Barra de Ticker (Letreiro)
            </h2>
            <p className="text-xs text-slate-400">Notícias corridas e plantões</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCreateNew(false)}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow"
            >
              + Marquee
            </button>
            <button
              onClick={() => handleCreateNew(true)}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow"
            >
              + Plantão
            </button>
          </div>
        </div>

        {/* List of Tickers */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {tickers.map((tk) => {
            const isOnAir = activeTicker?.id === tk.id;
            const isSelected = selectedItem?.id === tk.id;

            return (
              <div
                key={tk.id}
                onClick={() => setSelectedId(tk.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#182136] border-blue-500/80 shadow-md ring-1 ring-blue-500/50'
                    : 'bg-[#121828] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnAir ? 'bg-blue-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-bold text-sm text-white truncate max-w-[180px]">
                      {tk.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-black/60 text-blue-400 font-mono px-2 py-0.5 rounded uppercase">
                    {tk.isStaticBreaking ? 'Plantão Estático' : `${tk.speedSeconds}s Marquee`}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-semibold truncate">
                  {tk.headlineTitle || 'ASTRO TV'} • {tk.items.length} Manchetes
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  <div className="flex items-center gap-1.5">
                    {isOnAir ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTickerOnAir(null);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black uppercase tracking-wider shadow"
                      >
                        <Square className="w-3 h-3" /> NO AR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTickerOnAir(tk.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[#1f2b48] hover:bg-blue-600 text-slate-200 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Play className="w-3 h-3" /> COLOCAR NO AR
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueuedOverlay('ticker', tk);
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
                        setExportTarget(tk);
                        setIsExportModalOpen(true);
                      }}
                      title="Exportar Ticker"
                      className="p-1.5 bg-[#161d2d] hover:bg-blue-600 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir "${tk.name}"?`)) {
                          deleteTicker(tk.id);
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

      {/* Col 2: Ticker Editor & Headlines Manager (8 cols) */}
      {selectedItem ? (
        <div className="xl:col-span-8 bg-[#0e1320] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-[780px] overflow-y-auto">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-condensed">
                    Gerenciador de Notícias do Ticker
                  </h3>
                  <p className="text-xs text-slate-400">Adicione, edite ou reordene as manchetes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    savePreset('ticker', selectedItem.name, selectedItem);
                    alert('Ticker salvo como preset!');
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

            {/* Top Controls: Speed, Headline Title, Mode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Título da Faixa / Selo
                </label>
                <input
                  type="text"
                  value={selectedItem.headlineTitle || ''}
                  onChange={(e) => updateTicker(selectedItem.id, { headlineTitle: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-blue-500 uppercase"
                  placeholder="EX: ASTRO NOTÍCIAS"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Modo de Exibição
                </label>
                <select
                  value={selectedItem.isStaticBreaking ? 'static' : 'crawl'}
                  onChange={(e) =>
                    updateTicker(selectedItem.id, { isStaticBreaking: e.target.value === 'static' })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="crawl">Letreiro Rolante Contínuo (Marquee)</option>
                  <option value="static">Plantão Estático com Transição (Breaking)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Velocidade da Rolagem ({selectedItem.speedSeconds}s por ciclo)
                </label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={selectedItem.speedSeconds}
                  onChange={(e) =>
                    updateTicker(selectedItem.id, { speedSeconds: Number(e.target.value) })
                  }
                  className="w-full mt-2 accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Animação de Entrada
                </label>
                <select
                  value={selectedItem.animation?.entryType || 'slide'}
                  onChange={(e) =>
                    updateTicker(selectedItem.id, {
                      animation: {
                        ...(selectedItem.animation || { durationMs: 400, exitType: 'slide', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }),
                        entryType: e.target.value as any,
                      },
                    })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="headline-shutter">Headline Shutter (Elevação TV)</option>
                  <option value="blade-sweep">Blade Sweep (Lâmina)</option>
                  <option value="curtain-reveal">Curtain Reveal</option>
                  <option value="smooth-glide">Smooth Glide (Suave)</option>
                  <option value="glitch-in">Glitch Cyber TV</option>
                  <option value="slide">Slide Padrão</option>
                  <option value="fade">Fade com Blur</option>
                </select>
              </div>
            </div>

            {/* Headlines Items List */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                  Manchetes do Letreiro ({selectedItem.items.length})
                </span>
                <button
                  onClick={handleAddNewItem}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Manchete
                </button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {selectedItem.items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="p-3 bg-[#121828] border border-white/5 rounded-lg flex items-center gap-3"
                  >
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => reorderTickerItems(selectedItem.id, idx, Math.max(0, idx - 1))}
                        disabled={idx === 0}
                        className="p-1 bg-[#1a233a] hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          reorderTickerItems(
                            selectedItem.id,
                            idx,
                            Math.min(selectedItem.items.length - 1, idx + 1)
                          )
                        }
                        disabled={idx === selectedItem.items.length - 1}
                        className="p-1 bg-[#1a233a] hover:bg-slate-700 text-slate-300 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Category Tag Input */}
                    <div className="w-36 flex flex-col gap-1">
                      <input
                        type="text"
                        value={it.category}
                        onChange={(e) =>
                          updateTickerItem(selectedItem.id, it.id, { category: e.target.value })
                        }
                        className="w-full bg-[#0c101a] border border-white/10 rounded px-2 py-1 text-xs text-white font-bold uppercase"
                        placeholder="Tag"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={it.categoryColor || '#ffd166'}
                          onChange={(e) =>
                            updateTickerItem(selectedItem.id, it.id, {
                              categoryColor: e.target.value,
                            })
                          }
                          className="w-6 h-5 rounded border-0 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-400 font-mono">
                          {it.categoryColor || '#ffd166'}
                        </span>
                      </div>
                    </div>

                    {/* Headline Text Input */}
                    <input
                      type="text"
                      value={it.text}
                      onChange={(e) =>
                        updateTickerItem(selectedItem.id, it.id, { text: e.target.value })
                      }
                      className="flex-1 bg-[#0c101a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-blue-500"
                    />

                    {/* Remove Button */}
                    <button
                      onClick={() => removeTickerItem(selectedItem.id, it.id)}
                      disabled={selectedItem.items.length <= 1}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom On-Air Trigger */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status atual:</span>
              <span
                className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  activeTicker?.id === selectedItem.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeTicker?.id === selectedItem.id ? 'AO VIVO NO AR' : 'FORA DO AR'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQueuedOverlay('ticker', selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Colocar na Fila (Preview)
              </button>

              {activeTicker?.id === selectedItem.id ? (
                <button
                  onClick={() => setTickerOnAir(null)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Square className="w-4 h-4" />
                  TIRAR DO AR
                </button>
              ) : (
                <button
                  onClick={() => setTickerOnAir(selectedItem.id)}
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
        category="ticker"
        selectedItem={exportTarget}
      />
    </div>
  );
};
