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
  exportOverlayToPng, 
  exportOverlayToWebM, 
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
  const [format, setFormat] = useState<'html' | 'zip' | 'png' | 'webm' | 'json'>('html');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const itemToExport = selectedItem || {
    title: 'Overlay Geral',
    name: 'AstroTv Overlay',
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    setErrorMessage('');

    try {
      const filename = `astrotv_${category}_${(itemToExport.name || 'overlay').toLowerCase().replace(/\s+/g, '_')}`;

      if (format === 'png') {
        const elementId = `export-${category === 'lowerThird' ? 'lower-third' : category}`;
        await exportOverlayToPng(elementId, filename);
      } else if (format === 'webm') {
        const elementId = `export-${category === 'lowerThird' ? 'lower-third' : category}`;
        await exportOverlayToWebM(elementId, filename, 4);
      } else if (format === 'html') {
        await downloadStandaloneHtmlFile(category, itemToExport, brandTheme, filename, false);
      } else if (format === 'zip') {
        await downloadStandaloneHtmlFile(category, itemToExport, brandTheme, filename, true);
      } else if (format === 'json') {
        downloadJson(itemToExport, filename);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111624] border border-white/10 rounded-xl max-w-xl w-full p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-condensed uppercase tracking-wider">
              Exportar Asset de Transmissão
            </h2>
            <p className="text-sm text-slate-400">
              {itemToExport.name || 'Overlay Personalizado'} ({category.toUpperCase()})
            </p>
          </div>
        </div>

        {/* Format Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {/* HTML Standalone Card */}
          <button
            onClick={() => setFormat('html')}
            className={`flex flex-col text-left p-4 rounded-lg border transition-all ${
              format === 'html'
                ? 'bg-red-500/10 border-red-500 shadow-md ring-1 ring-red-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase">
                Recomendado OBS
              </span>
            </div>
            <div className="font-bold text-base">Pacote HTML Standalone</div>
            <p className="text-xs text-slate-400 mt-1">
              Arquivo HTML+CSS+JS pronto para abrir como Fonte de Navegador no OBS com fundo transparente e animações 60fps.
            </p>
          </button>

          {/* ZIP Bundle */}
          <button
            onClick={() => setFormat('zip')}
            className={`flex flex-col text-left p-4 rounded-lg border transition-all ${
              format === 'zip'
                ? 'bg-red-500/10 border-red-500 shadow-md ring-1 ring-red-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-6 h-6 text-cyan-400" />
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded uppercase">
                ZIP + Guia
              </span>
            </div>
            <div className="font-bold text-base">Pacote ZIP Completo</div>
            <p className="text-xs text-slate-400 mt-1">
              Pacote ZIP com o arquivo HTML e manual passo a passo de configuração para OBS Studio.
            </p>
          </button>

          {/* Transparent PNG */}
          <button
            onClick={() => setFormat('png')}
            className={`flex flex-col text-left p-4 rounded-lg border transition-all ${
              format === 'png'
                ? 'bg-red-500/10 border-red-500 shadow-md ring-1 ring-red-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded uppercase">
                1920×1080
              </span>
            </div>
            <div className="font-bold text-base">Imagem PNG Estática</div>
            <p className="text-xs text-slate-400 mt-1">
              Exporta o estado visual em alta resolução Full HD com fundo transparente para Premiere, DaVinci ou Photoshop.
            </p>
          </button>

          {/* WebM Video */}
          <button
            onClick={() => setFormat('webm')}
            className={`flex flex-col text-left p-4 rounded-lg border transition-all ${
              format === 'webm'
                ? 'bg-red-500/10 border-red-500 shadow-md ring-1 ring-red-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Video className="w-6 h-6 text-purple-400" />
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded uppercase">
                Alpha VP9
              </span>
            </div>
            <div className="font-bold text-base">Vídeo WebM Animado</div>
            <p className="text-xs text-slate-400 mt-1">
              Gravação animada da entrada e exibição com canal alfa transparente (VP9/VP8).
            </p>
          </button>

          {/* JSON Preset */}
          <button
            onClick={() => setFormat('json')}
            className={`flex flex-col text-left p-4 rounded-lg border transition-all col-span-1 md:col-span-2 ${
              format === 'json'
                ? 'bg-red-500/10 border-red-500 shadow-md ring-1 ring-red-500'
                : 'bg-[#161d2d] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-sm">Preset JSON para Backup e Compartilhamento</span>
            </div>
          </button>
        </div>

        {/* Feedback Messages */}
        {exportSuccess && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 mb-4 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            Download concluído com sucesso!
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 mb-4 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold text-sm transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-bold text-sm text-white shadow-lg transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Baixar Arquivo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
