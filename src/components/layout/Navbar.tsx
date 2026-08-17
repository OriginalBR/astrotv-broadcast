import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  AlertOctagon, 
  Palette, 
  Keyboard, 
  Download, 
  Upload, 
  Check, 
  Copy, 
  Radio, 
  Wifi, 
  WifiOff, 
  HelpCircle,
  X
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { downloadJson } from '../../utils/exporter';
import { broadcastBus, ConnectionStatus } from '../../utils/broadcastSync';

interface NavbarProps {
  onOpenShortcuts: () => void;
  onOpenTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenShortcuts,
  onOpenTheme,
}) => {
  const {
    activeLowerThird,
    activeScoreboard,
    activeTicker,
    activeBug,
    activeCountdown,
    activeFullscreen,
    isBlackout,
    audioMuted,
    stationName,
    toggleAudioMute,
    clearAllOverlays,
    importPresetsFromJson,
  } = useBroadcastStore();

  const [wsStatus, setWsStatus] = useState<ConnectionStatus>('connecting');
  const [clientCount, setClientCount] = useState<number>(1);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isObsHelpOpen, setIsObsHelpOpen] = useState(false);

  // Subscribe to real-time WebSocket connection state
  useEffect(() => {
    const unsubscribe = broadcastBus.subscribeStatus((status, count) => {
      setWsStatus(status);
      setClientCount(count);
    });
    return () => unsubscribe();
  }, []);

  const isAnyOnAir = 
    !!activeLowerThird || 
    !!activeScoreboard || 
    !!activeTicker || 
    !!activeBug || 
    !!activeCountdown || 
    !!activeFullscreen;

  const obsUrl = `${window.location.origin}/output`;

  const handleCopyObsUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleOpenOutputWindow = () => {
    window.open(
      '/output',
      'AstroTvOutputWindow',
      'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
  };

  const handleExportBackup = () => {
    const fullState = useBroadcastStore.getState();
    downloadJson(fullState, `astrotv_backup_${Date.now()}`);
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
          alert('Configurações e presets importados com sucesso!');
        } else {
          alert('Erro ao importar arquivo JSON.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="h-16 bg-[#0c101a] border-b border-white/10 px-6 flex items-center justify-between z-30 select-none">
      {/* Brand Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 bg-gradient-to-r from-red-600 via-red-700 to-slate-900 px-3 py-1.5 rounded-xl shadow-lg border border-red-500/40">
          <img src="/logo.png" alt="AstroTv Logo" className="w-7 h-7 rounded-lg object-contain ring-1 ring-yellow-400/60 shadow" />
          <span className="font-black text-xl tracking-wider text-white font-condensed uppercase">
            {stationName}
          </span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
            Mesa de Controle Broadcast
          </span>
          <span className="text-[10px] font-semibold text-red-400 tracking-wider mt-0.5">
            Imprensa Astro • TV Escolar Profissional
          </span>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="flex items-center gap-3">
        {/* On Air Pill */}
        <div 
          className={`flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 ${
            isBlackout 
              ? 'bg-black text-slate-400 border border-slate-700'
              : isAnyOnAir
                ? 'bg-red-600/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(230,57,70,0.4)]'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${
            isBlackout 
              ? 'bg-slate-600'
              : isAnyOnAir
                ? 'bg-red-500 animate-ping'
                : 'bg-emerald-500'
          }`} />
          {isBlackout ? 'BLACKOUT' : isAnyOnAir ? 'NO AR (PROGRAM)' : 'STANDBY (PRONTO)'}
        </div>

        {/* WebSocket Real-Time Connection Indicator */}
        <div 
          onClick={() => setIsObsHelpOpen(true)}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${
            wsStatus === 'connected'
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
              : wsStatus === 'connecting'
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                : 'bg-red-950/60 text-red-300 border-red-500/40 hover:bg-red-900/60'
          }`}
          title="Clique para ver instruções de conexão com o OBS Studio"
        >
          {wsStatus === 'connected' ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
          )}
          <span>
            {wsStatus === 'connected' 
              ? `WS Sincronizado (${clientCount} ${clientCount === 1 ? 'dispositivo' : 'dispositivos'})` 
              : wsStatus === 'connecting' 
                ? 'Conectando WebSocket...' 
                : 'WebSocket Offline (Reconectando...)'}
          </span>
          <HelpCircle className="w-3 h-3 opacity-60 ml-0.5" />
        </div>
      </div>

      {/* Master Action Tools */}
      <div className="flex items-center gap-2.5">
        {/* Copy OBS URL Button */}
        <button
          onClick={handleCopyObsUrl}
          title="Copiar URL para colar como Fonte de Navegador no OBS Studio"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161d2d] hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold border border-white/10 transition-all shadow"
        >
          {copiedUrl ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">URL Copiada!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline">Copiar Link OBS</span>
            </>
          )}
        </button>

        {/* Open Standalone OBS Output Canvas Popout */}
        <button
          onClick={handleOpenOutputWindow}
          title="Abrir Canvas de Saída em Janela 1920x1080"
          className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-lg transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Janela OBS</span>
        </button>

        {/* Theme Engine */}
        <button
          onClick={onOpenTheme}
          title="Personalização de Cores, Fontes e Logos"
          className="p-2 rounded-lg bg-[#161d2d] hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-colors"
        >
          <Palette className="w-4 h-4" />
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleAudioMute}
          title={audioMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar Efeitos Sonoros'}
          className={`p-2 rounded-lg border transition-colors ${
            audioMuted
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-[#161d2d] hover:bg-slate-700 text-slate-300 border-white/5'
          }`}
        >
          {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          title="Atalhos de Teclado"
          className="p-2 rounded-lg bg-[#161d2d] hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Presets Export */}
        <button
          onClick={handleExportBackup}
          title="Baixar Backup Geral de Presets em JSON"
          className="p-2 rounded-lg bg-[#161d2d] hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Presets Import */}
        <label
          title="Importar Backup de Presets JSON"
          className="p-2 rounded-lg bg-[#161d2d] hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 cursor-pointer transition-colors"
        >
          <Upload className="w-4 h-4" />
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={handleImportBackup} 
          />
        </label>

        {/* Blackout / Emergency Clear All */}
        <button
          onClick={clearAllOverlays}
          title="Limpar todos os overlays no ar imediatamente"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/50 text-red-200 rounded-lg text-xs font-bold transition-all shadow"
        >
          <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden lg:inline">LIMPAR TUDO</span>
        </button>
      </div>

      {/* OBS Connection Guide Modal */}
      {isObsHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
          <div className="bg-[#111624] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsObsHelpOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-condensed uppercase tracking-wider">
                  Conexão ao Vivo com o OBS Studio via WebSocket
                </h3>
                <p className="text-xs text-slate-400">
                  Status atual: <span className="text-emerald-400 font-bold uppercase">{wsStatus}</span> ({clientCount} conectados)
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6 leading-relaxed">
              <div className="bg-[#161d2d] p-3 rounded-lg border border-white/5">
                <strong className="text-white block mb-1">Como adicionar no OBS Studio:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>No OBS, clique no <strong className="text-white">+</strong> em Fontes e escolha <strong className="text-white">Navegador</strong> (*Browser*).</li>
                  <li>Cole a URL abaixo no campo <strong className="text-white">URL</strong>.</li>
                  <li>Defina <strong className="text-white">Largura: 1920</strong> e <strong className="text-white">Altura: 1080</strong>.</li>
                  <li>Marque <strong className="text-white">"Atualizar navegador quando a cena se tornar ativa"</strong>.</li>
                </ol>
              </div>

              <div className="flex items-center gap-2 bg-[#0a0d14] p-3 rounded-lg border border-white/10 font-mono text-cyan-400 text-xs break-all">
                <span className="flex-1 select-all">{obsUrl}</span>
                <button
                  onClick={handleCopyObsUrl}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-sans font-bold flex-shrink-0"
                >
                  {copiedUrl ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                ✦ O servidor WebSocket embutido sincroniza qualquer clique (troca de placar, tarja, vinheta) instantaneamente com a tela do OBS Studio, mesmo em processos e computadores separados.
              </p>
            </div>

            <button
              onClick={() => setIsObsHelpOpen(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs"
            >
              Fechar Instruções
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
