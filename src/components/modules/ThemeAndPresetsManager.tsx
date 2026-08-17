import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  Check, 
  RotateCcw, 
  Tv, 
  Layers, 
  FileJson,
  Sliders
} from 'lucide-react';
import { useBroadcastStore, defaultBrandTheme } from '../../store/useBroadcastStore';
import { OverlayTheme } from '../../types/broadcast';
import { downloadJson } from '../../utils/exporter';

export const ThemeAndPresetsManager: React.FC = () => {
  const {
    brandTheme,
    stationName,
    stationLogoUrl,
    savedPresets,
    setBrandTheme,
    setStationName,
    setStationLogo,
    deletePreset,
    importPresetsFromJson,
    setLowerThirdOnAir,
    setScoreboardOnAir,
    setTickerOnAir,
    setBugOnAir,
    setCountdownOnAir,
    setFullscreenOnAir,
  } = useBroadcastStore();

  const [activeTab, setActiveTab] = useState<'theme' | 'presets'>('theme');

  // Curated Professional Broadcast Palettes
  const presetPalettes: { name: string; primary: string; secondary: string; accent: string }[] = [
    { name: 'AstroTV News (Padrão)', primary: '#e63946', secondary: '#073b4c', accent: '#ffd166' },
    { name: 'Furacão Roxo (E-Sports)', primary: '#7C3AED', secondary: '#100B1E', accent: '#39FF88' },
    { name: 'Pôr do Sol Retrô (Vintage)', primary: '#FF6B35', secondary: '#2E1760', accent: '#FFD23F' },
    { name: 'Gelo Ártico (Elegante/Frio)', primary: '#2196F3', secondary: '#0A1929', accent: '#64FFDA' },
    { name: 'Ouro Olímpico (Premiação)', primary: '#D4AF37', secondary: '#0D1B2A', accent: '#C41E3A' },
    { name: 'Interclasse Rubro-Negro (Rivalidade)', primary: '#C1121F', secondary: '#101010', accent: '#E0E1DD' },
    { name: 'Futsal Noturno (Jogo à Noite)', primary: '#FF8500', secondary: '#1B1035', accent: '#00F5FF' },
    { name: 'Astro Sports (Ao Vivo)', primary: '#ff0033', secondary: '#0f172a', accent: '#00f0ff' },
    { name: 'Cyber Neon Tech', primary: '#f72585', secondary: '#3a0ca3', accent: '#4cc9f0' },
    { name: 'Brasil Esporte (Verde/Amarelo)', primary: '#009c3b', secondary: '#002776', accent: '#ffdf00' },
    { name: 'Midnight Gold VIP', primary: '#d4af37', secondary: '#0b0f19', accent: '#f3e5ab' },
    { name: 'Emerald High School', primary: '#06d6a0', secondary: '#118ab2', accent: '#ffd166' },
  ];

  const fontOptions: { id: string; name: string; category: string }[] = [
    { id: 'Outfit, sans-serif', name: 'Outfit (Moderno & Limpo)', category: 'Sans-Serif' },
    { id: '"Barlow Condensed", sans-serif', name: 'Barlow Condensed (Estilo TV Notícias)', category: 'Condensada' },
    { id: '"Bebas Neue", sans-serif', name: 'Bebas Neue (Caixa Alta Impacto)', category: 'Display' },
    { id: 'Teko, sans-serif', name: 'Teko (Ultra Condensada Esportes)', category: 'Display' },
    { id: 'Syne, sans-serif', name: 'Syne (Geométrica Futurista)', category: 'Display' },
    { id: 'Inter, sans-serif', name: 'Inter (Corporativa Neutra)', category: 'Sans-Serif' },
    { id: 'Oswald, sans-serif', name: 'Oswald (Noticiário Clássico)', category: 'Condensada' },
    { id: '"JetBrains Mono", monospace', name: 'JetBrains Mono (Digital / Placar)', category: 'Mono' },
  ];

  const handleApplyPalette = (palette: { primary: string; secondary: string; accent: string }) => {
    setBrandTheme({
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setStationLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerPreset = (preset: any) => {
    const { category, data } = preset;
    if (category === 'lowerThird') setLowerThirdOnAir(data.id);
    else if (category === 'scoreboard') setScoreboardOnAir(data.id);
    else if (category === 'ticker') setTickerOnAir(data.id);
    else if (category === 'bug') setBugOnAir(data.id);
    else if (category === 'countdown') setCountdownOnAir(data.id);
    else if (category === 'fullscreen') setFullscreenOnAir(data.id);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto select-none">
      <div className="bg-[#0e1320] border border-white/10 rounded-xl p-8 shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
              <Palette className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase font-condensed tracking-wider">
                Personalização Visual & Biblioteca de Presets
              </h2>
              <p className="text-sm text-slate-400">
                Gerencie a identidade de marca da emissora e presets salvos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#141b2d] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('theme')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'theme'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Identidade Visual & Cores
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'presets'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Biblioteca de Presets ({savedPresets.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Theme & Brand Customizer */}
        {activeTab === 'theme' && (
          <div className="space-y-8">
            {/* Station Brand Header Form */}
            <div className="bg-[#141b2d] p-6 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nome da Emissora / Projeto de TV
                </label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full bg-[#0c101a] border border-white/10 rounded-lg px-4 py-2.5 text-lg font-black text-white uppercase font-condensed focus:outline-none focus:border-red-500"
                  placeholder="EX: ASTRO TV"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Logo Principal da Emissora (PNG / SVG)
                </label>
                <div className="flex items-center gap-4">
                  {stationLogoUrl ? (
                    <img
                      src={stationLogoUrl}
                      alt="Station Logo"
                      className="h-12 max-w-[140px] object-contain bg-black/50 p-1.5 rounded-lg border border-white/10"
                    />
                  ) : (
                    <div className="px-4 py-2 bg-black/40 rounded-lg border border-white/10 text-xs font-bold text-slate-400">
                      Logo Padrão
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Enviar Logo
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {stationLogoUrl && (
                    <button
                      onClick={() => setStationLogo('')}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Curated Color Palettes */}
            <div>
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Paletas de Cores Pré-definidas de TV
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {presetPalettes.map((pal, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPalette(pal)}
                    className="p-4 bg-[#141b2d] hover:bg-[#1a233a] border border-white/5 hover:border-white/20 rounded-xl transition-all text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                        {pal.name}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-6 h-6 rounded-md shadow" style={{ backgroundColor: pal.primary }} />
                        <span className="w-6 h-6 rounded-md shadow" style={{ backgroundColor: pal.secondary }} />
                        <span className="w-6 h-6 rounded-md shadow" style={{ backgroundColor: pal.accent }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                      Aplicar →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="bg-[#141b2d] p-6 rounded-xl border border-white/5">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4">
                Seletores Individuais de Cores
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Primary */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Cor Primária (Destaque Principal)
                  </label>
                  <div className="flex items-center gap-2 bg-[#0c101a] p-2 rounded-lg border border-white/10">
                    <input
                      type="color"
                      value={brandTheme.primaryColor}
                      onChange={(e) => setBrandTheme({ primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandTheme.primaryColor}
                      onChange={(e) => setBrandTheme({ primaryColor: e.target.value })}
                      className="w-full bg-transparent text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Secondary */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Cor Secundária (Fundos & Barras)
                  </label>
                  <div className="flex items-center gap-2 bg-[#0c101a] p-2 rounded-lg border border-white/10">
                    <input
                      type="color"
                      value={brandTheme.secondaryColor}
                      onChange={(e) => setBrandTheme({ secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandTheme.secondaryColor}
                      onChange={(e) => setBrandTheme({ secondaryColor: e.target.value })}
                      className="w-full bg-transparent text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Accent */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Cor de Destaque / Acentos (Ouro/Amarelo)
                  </label>
                  <div className="flex items-center gap-2 bg-[#0c101a] p-2 rounded-lg border border-white/10">
                    <input
                      type="color"
                      value={brandTheme.accentColor}
                      onChange={(e) => setBrandTheme({ accentColor: e.target.value })}
                      className="w-8 h-8 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandTheme.accentColor}
                      onChange={(e) => setBrandTheme({ accentColor: e.target.value })}
                      className="w-full bg-transparent text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Selector */}
            <div className="bg-[#141b2d] p-6 rounded-xl border border-white/5">
              <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Type className="w-4 h-4 text-cyan-400" />
                Famílias Tipográficas Web de Transmissão
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Main Body Font */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Fonte Principal de Textos & Subtítulos
                  </label>
                  <select
                    value={brandTheme.fontFamily}
                    onChange={(e) => setBrandTheme({ fontFamily: e.target.value })}
                    className="w-full bg-[#0c101a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title Display Font */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Fonte de Títulos & Placares
                  </label>
                  <select
                    value={brandTheme.titleFontFamily}
                    onChange={(e) => setBrandTheme({ titleFontFamily: e.target.value })}
                    className="w-full bg-[#0c101a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Reset to Defaults */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  if (confirm('Restaurar tema padrão da AstroTv?')) {
                    setBrandTheme(defaultBrandTheme);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Tema Padrão
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Saved Presets Library */}
        {activeTab === 'presets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-slate-300">
                Você possui <strong className="text-white">{savedPresets.length}</strong> presets salvos na sua biblioteca local.
              </div>

              <button
                onClick={() => downloadJson(savedPresets, `astrotv_presets_${Date.now()}`)}
                disabled={savedPresets.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Todos os Presets em JSON
              </button>
            </div>

            {savedPresets.length === 0 ? (
              <div className="bg-[#141b2d] border border-white/5 rounded-xl p-12 text-center text-slate-400">
                <FileJson className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white mb-1">Nenhum preset personalizado salvo</h4>
                <p className="text-xs">
                  Você pode salvar qualquer overlay como preset nomeado clicando no botão "Salvar como Preset" dentro de cada módulo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPresets.map((pr) => (
                  <div
                    key={pr.id}
                    className="p-4 bg-[#141b2d] border border-white/10 rounded-xl flex flex-col justify-between gap-3 shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] bg-red-600/30 text-red-300 font-bold px-2 py-0.5 rounded uppercase">
                          {pr.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(pr.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{pr.name}</h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleTriggerPreset(pr)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow"
                      >
                        Acionar no Ar
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadJson(pr, `preset_${pr.name.toLowerCase().replace(/\s+/g, '_')}`)}
                          className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded"
                          title="Exportar JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deletePreset(pr.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-800 text-slate-300 hover:text-white rounded"
                          title="Excluir Preset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
