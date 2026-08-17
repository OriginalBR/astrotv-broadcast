import React, { useState } from 'react';
import { 
  Palette, 
  Tv, 
  Upload, 
  Plus, 
  Trash2, 
  Download, 
  FileJson, 
  Sparkles, 
  Check, 
  User, 
  Trophy, 
  Sliders, 
  Eye,
  Edit2
} from 'lucide-react';
import { useBroadcastStore, defaultBrandTheme } from '../../store/useBroadcastStore';
import { downloadJson } from '../../utils/exporter';
import { LowerThirdData, ScoreboardData, TickerData } from '../../types/broadcast';

type CustomSubTab = 'theme' | 'lowerThirds' | 'scoreboards' | 'ticker' | 'presets';

export const MobileCustomizationView: React.FC = () => {
  const {
    brandTheme,
    stationName,
    stationLogoUrl,
    lowerThirds,
    scoreboards,
    tickers,
    setBrandTheme,
    setStationName,
    setStationLogo,
    addLowerThird,
    updateLowerThird,
    deleteLowerThird,
    addScoreboard,
    updateScoreboard,
    deleteScoreboard,
    addTicker,
    updateTicker,
    addTickerItem,
    removeTickerItem,
    updateTickerItem,
    savedPresets,
    savePreset,
    deletePreset,
    importPresetsFromJson,
  } = useBroadcastStore();

  const [subTab, setSubTab] = useState<CustomSubTab>('theme');
  const [selectedLtId, setSelectedLtId] = useState<string>(lowerThirds[0]?.id || '');
  const [selectedSbId, setSelectedSbId] = useState<string>(scoreboards[0]?.id || '');
  const [selectedTkId, setSelectedTkId] = useState<string>(tickers[0]?.id || '');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Broadcast Palettes
  const presetPalettes = [
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

  const handleApplyPalette = (palette: { primary: string; secondary: string; accent: string }) => {
    setBrandTheme({
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
    });
    triggerToast();
  };

  const triggerToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setStationLogo(base64);
      triggerToast();
    };
    reader.readAsDataURL(file);
  };

  const handleExportBackup = () => {
    const fullState = useBroadcastStore.getState();
    downloadJson(fullState, `astrotv_backup_celular_${Date.now()}`);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importPresetsFromJson(content);
        if (success) {
          alert('Configurações importadas com sucesso!');
        } else {
          alert('Erro ao importar JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  const selectedLt = lowerThirds.find((lt) => lt.id === selectedLtId) || lowerThirds[0];
  const selectedSb = scoreboards.find((sb) => sb.id === selectedSbId) || scoreboards[0];
  const selectedTk = tickers.find((tk) => tk.id === selectedTkId) || tickers[0];

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#0a0d16] overflow-hidden text-white select-none">
      {/* Sub-Header Navigation Tabs */}
      <div className="bg-[#0f1524] border-b border-white/10 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
        <button
          onClick={() => setSubTab('theme')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'theme' ? 'bg-red-600 text-white shadow' : 'bg-[#151c2e] text-slate-400'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Identidade & Cores</span>
        </button>

        <button
          onClick={() => setSubTab('lowerThirds')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'lowerThirds' ? 'bg-red-600 text-white shadow' : 'bg-[#151c2e] text-slate-400'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Editor de Tarjas</span>
        </button>

        <button
          onClick={() => setSubTab('scoreboards')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'scoreboards' ? 'bg-red-600 text-white shadow' : 'bg-[#151c2e] text-slate-400'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Editor de Placares</span>
        </button>

        <button
          onClick={() => setSubTab('ticker')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'ticker' ? 'bg-red-600 text-white shadow' : 'bg-[#151c2e] text-slate-400'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Editor de Ticker</span>
        </button>

        <button
          onClick={() => setSubTab('presets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            subTab === 'presets' ? 'bg-red-600 text-white shadow' : 'bg-[#151c2e] text-slate-400'
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Backup JSON</span>
        </button>
      </div>

      {/* Main Form Content Area (Scrollable within mobile tab) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 max-h-full">
        
        {/* SUBTAB 1: TEMA, LOGO E CORES */}
        {subTab === 'theme' && (
          <div className="space-y-4">
            {/* Station Name & Logo */}
            <div className="bg-[#101728] border border-white/10 rounded-xl p-3.5 shadow-lg space-y-3">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                <Tv className="w-4 h-4" /> Nome da Emissora & Logo
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Nome da Emissora</label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-black font-condensed uppercase focus:border-red-500"
                  placeholder="EX: ASTRO TV"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Logo da TV (Upload do Celular)</label>
                <div className="flex items-center gap-3">
                  <img 
                    src={stationLogoUrl || '/logo.png'} 
                    alt="Logo" 
                    className="w-12 h-12 rounded-lg object-contain bg-black/60 p-1 border border-white/10" 
                  />
                  <label className="flex-1 py-2.5 px-3 bg-[#162035] hover:bg-slate-700 active:bg-red-600 rounded-lg border border-white/10 text-xs font-bold text-center cursor-pointer flex items-center justify-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Escolher Logo da Galeria</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Palettes of 1-Tap */}
            <div className="bg-[#101728] border border-white/10 rounded-xl p-3.5 shadow-lg space-y-2.5">
              <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Paletas Profissionais de 1 Toque
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {presetPalettes.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPalette(p)}
                    className="p-2 bg-[#0a0e1a] hover:bg-[#141d30] active:scale-95 rounded-lg border border-white/10 flex items-center gap-2 text-left transition-all"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="w-4 h-2 rounded-xs" style={{ backgroundColor: p.primary }} />
                      <span className="w-4 h-2 rounded-xs" style={{ backgroundColor: p.accent }} />
                    </div>
                    <span className="text-[11px] font-bold truncate leading-tight">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="bg-[#101728] border border-white/10 rounded-xl p-3.5 shadow-lg space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Ajuste Fino de Cores
              </h3>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Cor Primária</span>
                  <input
                    type="color"
                    value={brandTheme.primaryColor}
                    onChange={(e) => setBrandTheme({ primaryColor: e.target.value })}
                    className="w-full h-9 rounded-lg bg-transparent cursor-pointer border border-white/10"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Cor Secundária</span>
                  <input
                    type="color"
                    value={brandTheme.secondaryColor}
                    onChange={(e) => setBrandTheme({ secondaryColor: e.target.value })}
                    className="w-full h-9 rounded-lg bg-transparent cursor-pointer border border-white/10"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">Destaque (Ouro)</span>
                  <input
                    type="color"
                    value={brandTheme.accentColor}
                    onChange={(e) => setBrandTheme({ accentColor: e.target.value })}
                    className="w-full h-9 rounded-lg bg-transparent cursor-pointer border border-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: EDITOR DE TARJAS (LOWER THIRDS) */}
        {subTab === 'lowerThirds' && (
          <div className="space-y-3">
            {/* Lower Third Selector / New Button */}
            <div className="flex items-center justify-between gap-2">
              <select
                value={selectedLt?.id}
                onChange={(e) => setSelectedLtId(e.target.value)}
                className="flex-1 bg-[#101728] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white focus:border-red-500"
              >
                {lowerThirds.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name || lt.title} ({lt.tag || 'GC'})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const newLt: LowerThirdData = {
                    id: `lt-${Date.now()}`,
                    name: 'Nova Tarja Criada no Celular',
                    template: 'standard-news',
                    title: 'NOME DA PESSOA / NOTÍCIA',
                    subtitle: 'Cargo ou descrição detalhada da fala',
                    tag: 'REPORTAGEM',
                    tagColor: '#e63946',
                    animation: { entryType: 'blade-sweep', exitType: 'slide', durationMs: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
                    isOnAir: false,
                  };
                  addLowerThird(newLt);
                  setSelectedLtId(newLt.id);
                  triggerToast();
                }}
                className="px-3 py-2 bg-red-600 active:bg-red-700 text-white rounded-lg text-xs font-black uppercase flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova</span>
              </button>
            </div>

            {/* Edit Form */}
            {selectedLt && (
              <div className="bg-[#101728] border border-white/10 rounded-xl p-3.5 space-y-3 shadow-lg">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Título Principal / Nome</label>
                  <input
                    type="text"
                    value={selectedLt.title}
                    onChange={(e) => updateLowerThird(selectedLt.id, { title: e.target.value })}
                    className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-black font-condensed uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Subtítulo / Cargo</label>
                  <input
                    type="text"
                    value={selectedLt.subtitle}
                    onChange={(e) => updateLowerThird(selectedLt.id, { subtitle: e.target.value })}
                    className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Tag / Selo</label>
                    <input
                      type="text"
                      value={selectedLt.tag || ''}
                      onChange={(e) => updateLowerThird(selectedLt.id, { tag: e.target.value })}
                      className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold uppercase"
                      placeholder="EX: URGENTE"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Efeito de Animação</label>
                    <select
                      value={selectedLt.animation?.entryType || 'blade-sweep'}
                      onChange={(e) => updateLowerThird(selectedLt.id, {
                        animation: { ...(selectedLt.animation || { durationMs: 400, exitType: 'slide', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }), entryType: e.target.value as any }
                      })}
                      className="w-full bg-[#090d16] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
                    >
                      <option value="blade-sweep">Blade Sweep (Lâmina TV)</option>
                      <option value="elastic-snap">Elastic Snap (Rápido)</option>
                      <option value="curtain-reveal">Curtain Reveal</option>
                      <option value="slide">Slide Padrão</option>
                      <option value="fade">Fade Suave</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (lowerThirds.length > 1) {
                      deleteLowerThird(selectedLt.id);
                      setSelectedLtId(lowerThirds[0]?.id || '');
                    }
                  }}
                  disabled={lowerThirds.length <= 1}
                  className="w-full py-2 bg-red-950/60 active:bg-red-900 border border-red-500/30 text-red-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Esta Tarja</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: EDITOR DE PLACARES */}
        {subTab === 'scoreboards' && selectedSb && (
          <div className="space-y-3">
            <div className="bg-[#101728] border border-white/10 rounded-xl p-3.5 space-y-3 shadow-lg">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider">
                Configuração dos Times e Jogo
              </h3>

              {/* Team A Config */}
              <div className="p-2.5 bg-[#090d16] rounded-lg border border-white/10 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-300 block">Time Mandante (Time A)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={selectedSb.teamA.name}
                      onChange={(e) => updateScoreboard(selectedSb.id, { teamA: { ...selectedSb.teamA, name: e.target.value } })}
                      className="w-full bg-[#141b2d] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white uppercase font-bold"
                      placeholder="Nome Time A"
                    />
                  </div>
                  <div>
                    <input
                      type="color"
                      value={selectedSb.teamA.color}
                      onChange={(e) => updateScoreboard(selectedSb.id, { teamA: { ...selectedSb.teamA, color: e.target.value } })}
                      className="w-full h-8 bg-transparent rounded border border-white/10 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Team B Config */}
              <div className="p-2.5 bg-[#090d16] rounded-lg border border-white/10 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-300 block">Time Visitante (Time B)</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={selectedSb.teamB.name}
                      onChange={(e) => updateScoreboard(selectedSb.id, { teamB: { ...selectedSb.teamB, name: e.target.value } })}
                      className="w-full bg-[#141b2d] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white uppercase font-bold"
                      placeholder="Nome Time B"
                    />
                  </div>
                  <div>
                    <input
                      type="color"
                      value={selectedSb.teamB.color}
                      onChange={(e) => updateScoreboard(selectedSb.id, { teamB: { ...selectedSb.teamB, color: e.target.value } })}
                      className="w-full h-8 bg-transparent rounded border border-white/10 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Mode */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Layout do Placar na Transmissão</label>
                <select
                  value={selectedSb.layout}
                  onChange={(e) => updateScoreboard(selectedSb.id, { layout: e.target.value as any })}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-bold"
                >
                  <option value="compact-bug">Canto Superior Esquerdo (Padrão Notícias/TV)</option>
                  <option value="bottom-bar">Barra Inferior Larga (Estilo ESPN)</option>
                  <option value="top-center">Topo Central Flutuante (Basquete/Vôlei)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: EDITOR DE TICKER (NOTÍCIAS) */}
        {subTab === 'ticker' && selectedTk && (
          <div className="space-y-3">
            <div className="bg-[#101728] border border-white/10 rounded-xl p-3.5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider">
                  Manchetes do Letreiro
                </h3>
                <button
                  onClick={() => {
                    const newItem = {
                      id: `t-${Date.now()}`,
                      category: 'URGENTE',
                      categoryColor: '#e63946',
                      text: 'Nova notícia adicionada pelo celular...',
                    };
                    addTickerItem(selectedTk.id, newItem);
                  }}
                  className="px-2.5 py-1 bg-blue-600 active:bg-blue-700 text-white rounded text-[11px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Selo do Letreiro (Título Fixo)</label>
                <input
                  type="text"
                  value={selectedTk.headlineTitle || ''}
                  onChange={(e) => updateTicker(selectedTk.id, { headlineTitle: e.target.value })}
                  className="w-full bg-[#090d16] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-black uppercase"
                  placeholder="EX: ASTRO NOTÍCIAS"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {selectedTk.items.map((item, idx) => (
                  <div key={item.id} className="p-2.5 bg-[#090d16] rounded-lg border border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      value={item.category}
                      onChange={(e) => updateTickerItem(selectedTk.id, item.id, { category: e.target.value })}
                      className="w-20 bg-[#141b2d] border border-white/10 rounded px-2 py-1 text-[11px] font-black uppercase text-yellow-400"
                    />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateTickerItem(selectedTk.id, item.id, { text: e.target.value })}
                      className="flex-1 bg-[#141b2d] border border-white/10 rounded px-2 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => removeTickerItem(selectedTk.id, item.id)}
                      disabled={selectedTk.items.length <= 1}
                      className="text-slate-500 hover:text-red-400 disabled:opacity-20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: BACKUP E PRESETS JSON */}
        {subTab === 'presets' && (
          <div className="space-y-3">
            <div className="bg-[#101728] border border-white/10 rounded-xl p-4 space-y-4 shadow-lg">
              <div>
                <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider mb-1">
                  Exportar / Importar Backup Completo
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Salve todas as suas configurações, nomes de times, notícias e tarjas em um arquivo JSON direto no celular.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleExportBackup}
                  className="py-3 px-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-5 h-5" />
                  <span>Baixar Backup JSON</span>
                </button>

                <label className="py-3 px-3 bg-[#18233c] active:bg-slate-700 text-white rounded-xl border border-white/10 text-xs font-bold flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow">
                  <Upload className="w-5 h-5 text-cyan-400" />
                  <span>Importar JSON</span>
                  <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saved Notification Toast */}
      {showSavedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-2xl flex items-center gap-1.5 animate-bounce z-50">
          <Check className="w-3.5 h-3.5" />
          <span>Salvo com sucesso!</span>
        </div>
      )}
    </div>
  );
};
