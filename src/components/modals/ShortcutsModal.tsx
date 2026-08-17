import React from 'react';
import { Keyboard, X, Zap } from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { shortcuts } = useBroadcastStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-white">
      <div className="bg-[#111624] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-condensed uppercase tracking-wider">
              Atalhos de Teclado de Transmissão
            </h2>
            <p className="text-sm text-slate-400">
              Controle rápido de corte e acionamento ao vivo
            </p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-2">
          {shortcuts.map((sc, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-3 bg-[#161d2d] rounded-lg border border-white/5 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-slate-200">{sc.description}</span>
              </div>
              <kbd className="px-3 py-1 bg-black/80 border border-white/20 rounded font-mono text-xs font-bold text-amber-400 shadow">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Zap className="w-4 h-4" />
            Atalhos ativos em qualquer tela do painel
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold text-white transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
