import React, { useState } from 'react';
import { 
  Download, 
  FileCode, 
  Image as ImageIcon, 
  Video, 
  FileJson, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  X,
  Sparkles
} from 'lucide-react';
import { 
  exportOverlayItemToPng, 
  exportOverlayItemToWebM, 
  downloadStandaloneHtmlFile, 
  downloadJson 
} from '../../utils/exporter';
import { useBroadcastStore } from '../../store/useBroadcastStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen';
  selectedItem?: any;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  category = 'lowerThird',
  selectedItem,
}) => {
  const { brandTheme } = useBroadcastStore();
  const [format, setFormat] = useState<'html' | 'zip' | 'png' | 'webm' | 'json'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const itemToExport = selectedItem || {
    title: 'AstroTv Broadcast',
    subtitle: 'Imprensa Astro • TV Profissional',
    name: 'AstroTv Overlay',
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportSuccess(false);
    setErrorMessage('');

    try {
      const rawName = itemToExport.name || itemToExport.title || itemToExport.headlineTitle || 'overlay';
      const cleanName = rawName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
      const filename = `astrotv_${category}_${cleanName}`;

      if (format === 'png') {
        await exportOverlayItemToPng(category, itemToExport, brandTheme, filename);
      } else if (format === 'webm') {
        await exportOverlayItemToWebM(category, itemToExport, brandTheme, filename, 3, (pct) => {
          setExportProgress(pct);
        });
      } else if (format === 'html') {
        await downloadStandaloneHtmlFile(category, itemToExport, brandTheme, filename, false);
      } else if (format === 'zip') {
        await downloadStandaloneHtmlFile(category, itemToExport, brandTheme, filename, true);
      } else if (format === 'json') {
        await downloadJson(itemToExport, filename);
      }

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error('Export error:', err);
      setErrorMessage(err.message || 'Erro ao gerar arquivo para download.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#111624] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-condensed uppercase tracking-wider">
              Exportar Overlay de Transmissão
            </h2>
            <p className="text-xs text-slate-400">
              {itemToExport.name || itemToExport.title || itemToExport.headlineTitle || 'Overlay Selecionado'} ({category.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Format Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {/* Transparent PNG */}
          <button
            onClick={() => setFormat('png')}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
              format === 'png'
                ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded uppercase">
                1920×1080 Full HD
              </span>
            </div>
            <div className="font-bold text-sm">Imagem PNG Transparente</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Imagem com fundo transparente ideal para celulares, editores de vídeo e redes sociais.
            </p>
          </button>

          {/* WebM Animated Video */}
          <button
            onClick={() => setFormat('webm')}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
              format === 'webm'
                ? 'bg-purple-500/15 border-purple-500 shadow-md ring-1 ring-purple-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <Video className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded uppercase">
                Vídeo Animado
              </span>
            </div>
            <div className="font-bold text-sm">Vídeo Animado (Alpha 60fps)</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Vídeo em alta resolução gravando a animação de entrada com canal alfa transparente.
            </p>
          </button>

          {/* HTML Standalone Card */}
          <button
            onClick={() => setFormat('html')}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
              format === 'html'
                ? 'bg-emerald-500/15 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                OBS Local
              </span>
            </div>
            <div className="font-bold text-sm">Arquivo HTML Autocontido</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Código HTML pronto para abrir como Fonte de Navegador Local no OBS Studio a 60fps.
            </p>
          </button>

          {/* ZIP Bundle */}
          <button
            onClick={() => setFormat('zip')}
            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
              format === 'zip'
                ? 'bg-cyan-500/15 border-cyan-500 shadow-md ring-1 ring-cyan-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded uppercase">
                ZIP Completo
              </span>
            </div>
            <div className="font-bold text-sm">Pacote ZIP com Manual</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Pacote compactado com o HTML e instruções passo a passo de configuração para o OBS.
            </p>
          </button>
        </div>

        {/* Feedback Messages */}
        {exportSuccess && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 mb-4 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Arquivo gerado e baixado com sucesso!
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 mb-4 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Progress Bar for Video */}
        {isExporting && format === 'webm' && (
          <div className="mb-4 bg-[#0a0d14] p-3 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-1.5">
              <span>Renderizando vídeo Full HD com transparência...</span>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 font-bold text-xs text-white shadow-lg transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar Arquivo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
