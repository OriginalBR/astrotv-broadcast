import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  Plus, 
  Copy, 
  Trash2, 
  Download, 
  Edit2, 
  Sparkles, 
  Upload, 
  Eye,
  Clock,
  Settings2,
  Check
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { LowerThirdData, LowerThirdTemplate, AnimationType } from '../../types/broadcast';
import { ExportModal } from '../modals/ExportModal';

export const LowerThirdsManager: React.FC = () => {
  const {
    lowerThirds,
    activeLowerThird,
    setLowerThirdOnAir,
    addLowerThird,
    updateLowerThird,
    deleteLowerThird,
    duplicateLowerThird,
    setQueuedOverlay,
    savePreset,
  } = useBroadcastStore();

  const [selectedId, setSelectedId] = useState<string>(lowerThirds[0]?.id || '');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<LowerThirdData | null>(null);

  const selectedItem = lowerThirds.find((lt) => lt.id === selectedId) || lowerThirds[0];

  const handleCreateNew = () => {
    const newItem: LowerThirdData = {
      id: `lt-${Date.now()}`,
      name: 'Novo Lower Third',
      template: 'standard-news',
      title: 'TÍTULO DO PERSONAGEM',
      subtitle: 'Cargo ou Descrição da Notícia',
      tag: 'AO VIVO',
      tagColor: '#e63946',
      animation: {
        entryType: 'slide',
        exitType: 'slide',
        durationMs: 400,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        autoHideSeconds: 0,
      },
      isOnAir: false,
    };
    addLowerThird(newItem);
    setSelectedId(newItem.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedItem) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateLowerThird(selectedItem.id, { avatarUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAsPreset = () => {
    if (!selectedItem) return;
    savePreset('lowerThird', selectedItem.name, selectedItem);
    alert(`Preset "${selectedItem.name}" salvo com sucesso!`);
  };

  const templates: { id: LowerThirdTemplate; label: string; desc: string }[] = [
    { id: 'standard-news', label: 'Noticiário Padrão', desc: 'Nome + Cargo com barra geométrica' },
    { id: 'interview-avatar', label: 'Entrevista / VIP', desc: 'Foto em círculo + Nome + Cargo' },
    { id: 'breaking-bar', label: 'Plantão Urgente', desc: 'Faixa vermelha com efeito de alerta' },
    { id: 'quote', label: 'Citação / Destaque', desc: 'Aspas elegantes e autor da fala' },
    { id: 'modern-minimal', label: 'Moderno Minimal', desc: 'Pílula de vidro sutil com brilho' },
    { id: 'school-profile', label: 'Imprensa Astro', desc: 'Perfil de estudante ou professor' },
  ];

  const animations: { id: AnimationType; label: string; tag: string }[] = [
    { id: 'blade-sweep', label: 'Blade Sweep (ESPN / Sportv)', tag: 'PREMIUM' },
    { id: 'curtain-reveal', label: 'Curtain Reveal (Split Wipe)', tag: 'NOVO' },
    { id: 'elastic-snap', label: 'Elastic Snap (Impacto Rápido)', tag: 'PUNCH' },
    { id: 'flip-unfold', label: '3D Flip Unfold (Desdobrar 3D)', tag: '3D' },
    { id: 'headline-shutter', label: 'Headline Shutter (Elevação)', tag: 'TV NEWS' },
    { id: 'neon-flare', label: 'Neon Flare (Brilho Luminous)', tag: 'GLOW' },
    { id: 'smooth-glide', label: 'Smooth Glide (Cinemático)', tag: 'CINEMA' },
    { id: 'glitch-in', label: 'Glitch Cyber TV', tag: 'CYBER' },
    { id: 'scale-bounce', label: 'Scale Bounce Dinâmico', tag: 'BOUNCE' },
    { id: 'slide', label: 'Slide Lateral Padrão', tag: 'CLÁSSICO' },
    { id: 'wipe', label: 'Wipe (Corte Limpo)', tag: 'CLÁSSICO' },
    { id: 'fade', label: 'Fade Suave com Blur', tag: 'CLÁSSICO' },
    { id: 'typewriter', label: 'Slide Superior (Typewriter)', tag: 'CLÁSSICO' },
  ];

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 select-none">
      {/* Column 1: Presets & Items List (4 cols) */}
      <div className="xl:col-span-4 bg-[#0e1320] border border-white/10 rounded-xl p-4 flex flex-col h-[780px]">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div>
            <h2 className="text-base font-bold text-white uppercase font-condensed tracking-wider">
              Lista de Lower Thirds
            </h2>
            <p className="text-xs text-slate-400">Selecione para editar ou acionar</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {lowerThirds.map((item) => {
            const isOnAir = activeLowerThird?.id === item.id;
            const isSelected = selectedItem?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedId(item.id)}
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
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] bg-black/50 text-slate-400 font-mono px-2 py-0.5 rounded uppercase">
                    {item.template}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-semibold truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {item.subtitle}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-1">
                  <div className="flex items-center gap-1.5">
                    {isOnAir ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLowerThirdOnAir(null);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-black uppercase tracking-wider shadow"
                      >
                        <Square className="w-3 h-3" /> NO AR
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLowerThirdOnAir(item.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-[#1f2b48] hover:bg-red-600 text-slate-200 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Play className="w-3 h-3" /> COLOCAR NO AR
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueuedOverlay('lowerThird', item);
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
                        setExportTarget(item);
                        setIsExportModalOpen(true);
                      }}
                      title="Exportar (PNG / WebM / HTML / JSON)"
                      className="p-1.5 bg-[#161d2d] hover:bg-blue-600 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateLowerThird(item.id);
                      }}
                      title="Duplicar"
                      className="p-1.5 bg-[#161d2d] hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Excluir "${item.name}"?`)) {
                          deleteLowerThird(item.id);
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

      {/* Column 2: Editor & Live Customizer (8 cols) */}
      {selectedItem ? (
        <div className="xl:col-span-8 bg-[#0e1320] border border-white/10 rounded-xl p-6 flex flex-col justify-between h-[780px] overflow-y-auto">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600/20 text-red-400 rounded-lg border border-red-500/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white uppercase font-condensed">
                    Editor de Lower Third
                  </h3>
                  <p className="text-xs text-slate-400">Ajuste os dados em tempo real</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAsPreset}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a233a] hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-white/10 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Salvar como Preset
                </button>
                <button
                  onClick={() => {
                    setExportTarget(selectedItem);
                    setIsExportModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Overlay
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Preset Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome de Identificação Interna
                </label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => updateLowerThird(selectedItem.id, { name: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Template Selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Template de Layout Visual
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => updateLowerThird(selectedItem.id, { template: tpl.id })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedItem.template === tpl.id
                          ? 'bg-red-600/20 border-red-500 text-white shadow ring-1 ring-red-500'
                          : 'bg-[#141b2d] border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs">{tpl.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{tpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Main Text */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Texto Principal (Nome / Notícia)
                </label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => updateLowerThird(selectedItem.id, { title: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-red-500 uppercase font-condensed"
                  placeholder="EX: GABRIEL VASCONCELOS"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Texto Secundário (Cargo / Detalhe)
                </label>
                <input
                  type="text"
                  value={selectedItem.subtitle}
                  onChange={(e) => updateLowerThird(selectedItem.id, { subtitle: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-red-500"
                  placeholder="EX: Âncora do AstroTv Notícias"
                />
              </div>

              {/* Tag / Category Badge */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tag / Chamada (Opcional)
                </label>
                <input
                  type="text"
                  value={selectedItem.tag || ''}
                  onChange={(e) => updateLowerThird(selectedItem.id, { tag: e.target.value })}
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-red-500 uppercase"
                  placeholder="EX: AO VIVO, ENTREVISTA, DIRETO DE BRASÍLIA"
                />
              </div>

              {/* Tag Color */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Cor da Tag
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedItem.tagColor || '#e63946'}
                    onChange={(e) => updateLowerThird(selectedItem.id, { tagColor: e.target.value })}
                    className="w-10 h-9 bg-transparent border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedItem.tagColor || '#e63946'}
                    onChange={(e) => updateLowerThird(selectedItem.id, { tagColor: e.target.value })}
                    className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Avatar / Photo Upload */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Foto / Avatar / Logo do Convidado
                </label>
                <div className="flex items-center gap-4 bg-[#141b2d] p-3 rounded-lg border border-white/10">
                  {selectedItem.avatarUrl ? (
                    <img
                      src={selectedItem.avatarUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-500 font-bold">
                      Sem Foto
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={selectedItem.avatarUrl || ''}
                      onChange={(e) => updateLowerThird(selectedItem.id, { avatarUrl: e.target.value })}
                      placeholder="Cole a URL da imagem ou envie do computador..."
                      className="w-full bg-[#0e1320] border border-white/10 rounded px-2 py-1 text-xs text-white mb-1.5"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      Enviar Foto do Computador (PNG/JPG)
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  {selectedItem.avatarUrl && (
                    <button
                      onClick={() => updateLowerThird(selectedItem.id, { avatarUrl: '' })}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {/* Animation Engine Settings */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Efeito de Animação de Entrada
                </label>
                <select
                  value={selectedItem.animation.entryType}
                  onChange={(e) =>
                    updateLowerThird(selectedItem.id, {
                      animation: {
                        ...selectedItem.animation,
                        entryType: e.target.value as AnimationType,
                      },
                    })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-red-500"
                >
                  {animations.map((anim) => (
                    <option key={anim.id} value={anim.id}>
                      {anim.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto Hide Timer */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Timer de Ocultação Automática
                </label>
                <select
                  value={selectedItem.animation.autoHideSeconds || 0}
                  onChange={(e) =>
                    updateLowerThird(selectedItem.id, {
                      animation: {
                        ...selectedItem.animation,
                        autoHideSeconds: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-[#141b2d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-red-500"
                >
                  <option value={0}>Manual (Permanece até tirar do ar)</option>
                  <option value={5}>5 Segundos (Rápido)</option>
                  <option value={8}>8 Segundos (Padrão TV)</option>
                  <option value={12}>12 Segundos (Longo)</option>
                  <option value={20}>20 Segundos (Entrevista)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Master Actions for Selected Overlay */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status atual:</span>
              <span
                className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  activeLowerThird?.id === selectedItem.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {activeLowerThird?.id === selectedItem.id ? 'AO VIVO NO AR' : 'FORA DO AR'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setQueuedOverlay('lowerThird', selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Eye className="w-4 h-4" />
                Colocar na Fila (Preview)
              </button>

              {activeLowerThird?.id === selectedItem.id ? (
                <button
                  onClick={() => setLowerThirdOnAir(null)}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-black uppercase tracking-wider shadow-lg transition-all"
                >
                  <Square className="w-4 h-4" />
                  TIRAR DO AR
                </button>
              ) : (
                <button
                  onClick={() => setLowerThirdOnAir(selectedItem.id)}
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

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        category="lowerThird"
        selectedItem={exportTarget}
      />
    </div>
  );
};
