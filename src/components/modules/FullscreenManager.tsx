import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Eye, 
  Sparkles, 
  LayoutTemplate, 
  Quote, 
  BarChart3, 
  Calendar 
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { FullscreenData, FullscreenTemplate, AnimationType } from '../../types/broadcast';
import { ExportModal } from '../modals/ExportModal';

export const FullscreenManager: React.FC = () => {
  const {
    fullscreens,
    activeFullscreen,
    setFullscreenOnAir,
    addFullscreen,
    updateFullscreen,
    deleteFullscreen,
    duplicateFullscreen,
    setQueuedOverlay,
    savePreset,
  } = useBroadcastStore();

  const [selectedId, setSelectedId] = useState<string>(fullscreens[0]?.id || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<FullscreenData | null>(null);

  const selectedItem = fullscreens.find((fs) => fs.id === selectedId) || fullscreens[0];

  const handleCreateNew = (template: FullscreenTemplate = 'stat-summary') => {
    const newItem: FullscreenData = {
      id: `fs-${Date.now()}`,
      name: `Novo Slide Fullscreen (${template})`,
      template,
      title: 'TÍTULO DO GRÁFICO EM TELA CHEIA',
      subtitle: 'Explicação detalhada dos dados e informações para a transmissão',
      category: 'INFORMAÇÃO ESPECIAL',
      statNumber: template === 'stat-summary' ? '85%' : undefined,
      statLabel: template === 'stat-summary' ? 'Índice de Aprovação dos Alunos' : undefined,
      items: [
        'Primeiro ponto relevante ou estatística',
        'Segundo dado de destaque da matéria',
        'Terceira informação complementar do infográfico',
      ],
      animation: {
        entryType: 'slide',
        exitType: 'fade',
        durationMs: 450,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      isOnAir: false,
    };
    addFullscreen(newItem);
    setSelectedId(newItem.id);
  };

  const handleAddItem = () => {
    if (!selectedItem) return;
    const current = selectedItem.items || [];
    updateFullscreen(selectedItem.id, {
      items: [...current, `Novo item de informação ${current.length + 1}`],
    });
  };

  const handleUpdateItem = (index: number, text: string) => {
    if (!selectedItem || !selectedItem.items) return;
    const updated = [...selectedItem.items];
    updated[index] = text;
    updateFullscreen(selectedItem.id, { items: updated });
  };

  const handleRemoveItem = (index: number) => {
    if (!selectedItem || !selectedItem.items) return;
    const updated = selectedItem.items.filter((_, idx) => idx !== index);
    updateFullscreen(selectedItem.id, { items: updated });
  };

  const templates: { id: FullscreenTemplate; label: string; desc: string; icon: string }[] = [
    { id: 'stat-summary', label: 'Resumo de Estatísticas', desc: 'Número gigante em destaque + lista de dados', icon: '📊' },
    { id: 'schedule-agenda', label: 'Agenda & Cronograma', desc: 'Grade de eventos e horários em 2 colunas', icon: '📅' },
    { id: 'quote-card', label: 'Citação em Tela Cheia', desc: 'Frase de impacto com autor e cargo', icon: '💬' },
    { id: 'breaking-fullscreen', label: 'Plantão Extraordinário', desc: 'Tela de breaking news urgente', icon: '🚨' },
  ];

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
      {/* Col 1: Fullscreen Presets (4 cols) */}
      <div className="xl:col-span-4 bg-[#0e1320] border border-white/10 rounded-xl p-4 flex flex-col h-[780px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase font-condensed tracking-wider">
              Gráficos em Tela Cheia
            </h2>
            <p className="text-xs text-slate-400">Slides, dados, citações e cronogramas</p>
          </div>
          <button
            onClick={() => handleCreateNew('stat-summary')}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Slide
          </button>
        </div>

        {/* List of Fullscreens */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {fullscreens.map((fs) => {
            const isOnAir = activeFullscreen?.id === fs.id;
            const isSelected = selectedItem?.id === fs.id;

            return (
              <div
                key={fs.id}
                onClick={() => setSelectedId(fs.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-[#182136] border-emerald-500/80 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-[#121828] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOnAir ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
                      }`}
                    />
                    <span className="font-bold text-sm text-white truncate max-w-[180px]">
                      {fs.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-black/60 text-emerald-400 font-mono px-2 py-0.5 rounded uppercase">
                    {fs.template}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-semibold truncate">
                  {fs.title}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  <div className="flex items-center gap-1.5">
                    {isOnAir ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenOnAir(null);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-black uppercase tracking-wider shadow"
                      >
                        <Square className="w-3 h-3" /> NO AR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenOnAir(fs.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[#1f2b48] hover:bg-emerald-600 text-slate-200 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Play className="w-3 h-3" /> COLOCAR NO AR
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueuedOverlay('fullscreen', fs);
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
                        setExportTarget(fs);
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
                        duplicateFullscreen(fs.id);
                      }}
                      title="Duplicar"
                      className="p-1.5 bg-[#161d2d] hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir "${fs.name}"?`)) {
                          deleteFullscreen(fs.id);
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

      {/* Col 2: Fullscreen Editor (8 cols) */}
      {selectedItem ? (
        <div className="xl:col-span-8 bg-[#0e1320] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-[780px] overflow-y-auto">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <LayoutTemplate className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-condensed">
                    Editor de Slide em Tela Cheia
                  </h3>
                  <p className="text-xs text-slate-400">Infográficos, estatísticas e cronogramas</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    savePreset('fullscreen', selectedItem.name, selectedItem);
                    alert('Slide salvo como preset!');
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

            {/* Template Selector Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => updateFullscreen(selectedItem.id, { template: tpl.id })}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedItem.template === tpl.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-white shadow ring-1 ring-emerald-500'
                      : 'bg-[#141b2d] border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="text-xl mb-1">{tpl.icon}</div>
                  <div className="font-bold text-xs">{tpl.label}</div>
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tag / Categoria Superior
                </label>
                <input
                  type="text"
                  value={selectedItem.category}
                  onChange={(e) => updateFullscreen(selectedItem.id, { category: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-emerald-500"
                  placeholder="EX: RESULTADO OFICIAL"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome do Slide (Identificação)
                </label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => updateFullscreen(selectedItem.id, { name: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Título Principal do Slide
                </label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => updateFullscreen(selectedItem.id, { title: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-bold uppercase font-condensed focus:outline-none focus:border-emerald-500"
                  placeholder="EX: APURAÇÃO DAS ELEIÇÕES DO GRÊMIO 2026"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Subtítulo / Descrição Explicativa
                </label>
                <input
                  type="text"
                  value={selectedItem.subtitle}
                  onChange={(e) => updateFullscreen(selectedItem.id, { subtitle: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Conditional: Stat Summary Fields */}
              {selectedItem.template === 'stat-summary' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Número / Dado Gigante em Destaque
                    </label>
                    <input
                      type="text"
                      value={selectedItem.statNumber || ''}
                      onChange={(e) => updateFullscreen(selectedItem.id, { statNumber: e.target.value })}
                      className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-lg font-mono font-black text-yellow-400 focus:outline-none focus:border-emerald-500"
                      placeholder="EX: 64.2% ou 1.480"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Legenda do Número
                    </label>
                    <input
                      type="text"
                      value={selectedItem.statLabel || ''}
                      onChange={(e) => updateFullscreen(selectedItem.id, { statLabel: e.target.value })}
                      className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="EX: Votos válidos para a Chapa Inovação"
                    />
                  </div>
                </>
              )}

              {/* Conditional: Quote Card Fields */}
              {selectedItem.template === 'quote-card' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Autor da Citação
                    </label>
                    <input
                      type="text"
                      value={selectedItem.quoteAuthor || ''}
                      onChange={(e) => updateFullscreen(selectedItem.id, { quoteAuthor: e.target.value })}
                      className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                      placeholder="EX: Prof. Carlos Eduardo Silveira"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Cargo / Instituição do Autor
                    </label>
                    <input
                      type="text"
                      value={selectedItem.quoteAuthorRole || ''}
                      onChange={(e) => updateFullscreen(selectedItem.id, { quoteAuthorRole: e.target.value })}
                      className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="EX: Diretor Geral da Instituição Astro"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Items / Points List */}
            {selectedItem.template !== 'quote-card' && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                    Itens e Tópicos do Slide ({selectedItem.items?.length || 0})
                  </span>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Item
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedItem.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-black/50 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateItem(idx, e.target.value)}
                        className="flex-1 bg-[#141b2d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom On-Air Trigger */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status atual:</span>
              <span
                className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  activeFullscreen?.id === selectedItem.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeFullscreen?.id === selectedItem.id ? 'AO VIVO NO AR' : 'FORA DO AR'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQueuedOverlay('fullscreen', selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Colocar na Fila (Preview)
              </button>

              {activeFullscreen?.id === selectedItem.id ? (
                <button
                  onClick={() => setFullscreenOnAir(null)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Square className="w-4 h-4" />
                  TIRAR DO AR
                </button>
              ) : (
                <button
                  onClick={() => setFullscreenOnAir(selectedItem.id)}
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
        category="fullscreen"
        selectedItem={exportTarget}
      />
    </div>
  );
};
