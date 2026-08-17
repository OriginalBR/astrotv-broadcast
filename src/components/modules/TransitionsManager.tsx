import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Volume2, 
  Upload, 
  Eye, 
  Flame, 
  Layers, 
  Zap, 
  Radio 
} from 'lucide-react';
import { useBroadcastStore } from '../../store/useBroadcastStore';
import { TransitionType } from '../../types/broadcast';
import { broadcastAudio } from '../../utils/audioSynthesizer';

export const TransitionsManager: React.FC = () => {
  const {
    activeTransition,
    stationName,
    triggerTransition,
    audioMuted,
  } = useBroadcastStore();

  const [selectedType, setSelectedType] = useState<TransitionType>('wipe-right');
  const [selectedSound, setSelectedSound] = useState<'whoosh' | 'stinger' | 'glitch' | 'chime' | 'none'>('whoosh');
  const [durationMs, setDurationMs] = useState<number>(450);

  const transitionsList: { id: TransitionType; label: string; desc: string; icon: string }[] = [
    { id: 'blade-stinger', label: 'Blade Stinger (Dupla Lâmina)', desc: 'Lâminas angulares cortando a tela em 60fps', icon: '⚔️' },
    { id: 'wipe-right', label: 'Wipe Diagonal Esporte', desc: 'Faixa angular em alta velocidade com cores da TV', icon: '⚡' },
    { id: 'shutter-split', label: 'Shutter Split (Divisão Tripla)', desc: 'Persianas divididas horizontalmente com banner central', icon: '🪟' },
    { id: 'cyber-shockwave', label: 'Cyber Shockwave (Impacto)', desc: 'Onda de choque circular com reflexo neon', icon: '💫' },
    { id: 'glitch-wipe', label: 'Glitch Cyber TV', desc: 'Efeito digital de interferência de sinal e ruído estático', icon: '📺' },
    { id: 'zoom-blur', label: 'Zoom Impact Blur', desc: 'Explosão de escala com brilho central e gradiente', icon: '💥' },
    { id: 'logo-stinger', label: 'Logo Stinger Institucional', desc: 'Vinheta limpa com o nome da emissora em destaque', icon: '🌟' },
    { id: 'circle-iris', label: 'Iris Circular', desc: 'Abertura/fechamento em formato de lente de câmera', icon: '⭕' },
  ];

  const soundList: { id: 'whoosh' | 'stinger' | 'glitch' | 'chime' | 'none'; label: string; desc: string }[] = [
    { id: 'whoosh', label: 'Whoosh Suave (Ar / Vento)', desc: 'Sintetizado com ruído rosa e filtro passa-banda' },
    { id: 'stinger', label: 'Stinger Impact (Grave)', desc: 'Impacto forte de baixa frequência' },
    { id: 'glitch', label: 'Ruído Digital Glitch', desc: 'Ondas quadradas estáticas com modulação de tom' },
    { id: 'chime', label: 'Sino / Alerta Jornalístico', desc: 'Acorde brilhante de 4 notas harmônicas' },
    { id: 'none', label: 'Sem Áudio (Silencioso)', desc: 'Transição puramente visual' },
  ];

  const handleTestSound = (snd: 'whoosh' | 'stinger' | 'glitch' | 'chime' | 'none') => {
    broadcastAudio.playSound(snd, undefined, false);
  };

  const handleFireTransition = () => {
    triggerTransition(selectedType, selectedSound, durationMs);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto select-none">
      <div className="bg-[#0e1320] border border-white/10 rounded-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase font-condensed tracking-wider">
                Vinhetas & Transições de Transmissão (Stingers)
              </h2>
              <p className="text-sm text-slate-400">
                Animações em tela cheia com áudio sintetizado em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={handleFireTransition}
            disabled={activeTransition?.isActive}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:opacity-90 text-white rounded-xl text-sm font-black uppercase tracking-wider shadow-[0_0_25px_rgba(230,57,70,0.5)] transition-all transform hover:scale-105 disabled:opacity-50"
          >
            <Play className="w-5 h-5 fill-white" />
            DISPARAR VINHETA NO AR AGORA
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Col 1: Visual Transitions Selector */}
          <div>
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              1. Selecionar Efeito Visual de Transição
            </h3>

            <div className="space-y-3">
              {transitionsList.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => setSelectedType(tr.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedType === tr.id
                      ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg ring-1 ring-amber-500'
                      : 'bg-[#141b2d] border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{tr.icon}</span>
                    <div>
                      <div className="font-bold text-base text-white">{tr.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{tr.desc}</div>
                    </div>
                  </div>
                  {selectedType === tr.id && (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded">
                      SELECIONADO
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Duration Slider */}
            <div className="mt-6 bg-[#141b2d] p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase mb-2">
                <span>Duração da Animação:</span>
                <span className="font-mono text-amber-400 text-sm">{durationMs}ms</span>
              </div>
              <input
                type="range"
                min="300"
                max="1000"
                step="50"
                value={durationMs}
                onChange={(e) => setDurationMs(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>300ms (Corte Rápido)</span>
                <span>450ms (Recomendado)</span>
                <span>1000ms (Lento)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Audio Synthesizer & Sound Effects */}
          <div>
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              2. Efeito Sonoro da Vinheta (Web Audio API)
            </h3>

            <div className="space-y-3">
              {soundList.map((snd) => (
                <div
                  key={snd.id}
                  onClick={() => setSelectedSound(snd.id)}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedSound === snd.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500'
                      : 'bg-[#141b2d] border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-bold text-base text-white">{snd.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{snd.desc}</div>
                  </div>

                  {snd.id !== 'none' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestSound(snd.id);
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Ouvir
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Live Preview Box */}
            <div className="mt-6 bg-[#141b2d] p-6 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Atalho Global
              </div>
              <p className="text-xs text-slate-300 mb-4">
                Pressione a tecla <kbd className="px-2.5 py-1 bg-black rounded border border-white/20 font-mono text-amber-400 font-bold">ESPAÇO</kbd> no teclado para disparar a vinheta em qualquer momento da transmissão ao vivo.
              </p>
              <button
                onClick={handleFireTransition}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-white/10 transition-colors"
              >
                Testar Vinheta no Monitor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
