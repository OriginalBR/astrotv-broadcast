import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  BroadcastState, 
  LowerThirdData, 
  ScoreboardData, 
  TickerData, 
  TickerItem,
  BugData, 
  CountdownData, 
  FullscreenData, 
  OverlayTheme, 
  TransitionType,
  OverlayPreset,
  KeyboardShortcut
} from '../types/broadcast';
import { broadcastBus } from '../utils/broadcastSync';
import { broadcastAudio } from '../utils/audioSynthesizer';

// Initial Brand Theme
export const defaultBrandTheme: OverlayTheme = {
  primaryColor: '#e63946',
  secondaryColor: '#073b4c',
  accentColor: '#ffd166',
  textColor: '#ffffff',
  subtextColor: '#94a3b8',
  fontFamily: 'Outfit, sans-serif',
  titleFontFamily: 'Barlow Condensed, sans-serif',
  borderRadius: 4,
  glassOpacity: 0.92,
  enableGlow: true,
};

// Initial Presets for Lower Thirds
export const initialLowerThirds: LowerThirdData[] = [
  {
    id: 'lt-1',
    name: 'Apresentador Principal',
    template: 'standard-news',
    title: 'GABRIEL VASCONCELOS',
    subtitle: 'Âncora do AstroTv Notícias',
    tag: 'AO VIVO',
    tagColor: '#e63946',
    animation: { entryType: 'slide', exitType: 'slide', durationMs: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    isOnAir: false,
  },
  {
    id: 'lt-2',
    name: 'Entrevista com Convidado (Avatar)',
    template: 'interview-avatar',
    title: 'PROFª. DRA. HELENA SOUZA',
    subtitle: 'Coordenadora de Robótica e Inovação',
    tag: 'ENTREVISTA EXCLUSIVA',
    tagColor: '#3b82f6',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    animation: { entryType: 'scale-bounce', exitType: 'fade', durationMs: 450, easing: 'ease-out', autoHideSeconds: 8 },
    isOnAir: false,
  },
  {
    id: 'lt-3',
    name: 'Plantão Urgente (Breaking)',
    template: 'breaking-bar',
    title: 'ELEIÇÕES DO GRÊMIO ESTUDANTIL 2026',
    subtitle: 'Apuração oficial em tempo real no auditório principal',
    tag: 'PLANTÃO URGENTE',
    tagColor: '#e63946',
    animation: { entryType: 'glitch-in', exitType: 'wipe', durationMs: 350, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    isOnAir: false,
  },
  {
    id: 'lt-4',
    name: 'Citação em Destaque',
    template: 'quote',
    title: '"A tecnologia é a nossa ponte para o futuro."',
    subtitle: 'Mariana Lima, Presidente do Grêmio',
    tag: 'DESTAQUE',
    tagColor: '#ffd166',
    animation: { entryType: 'fade', exitType: 'fade', durationMs: 500, easing: 'ease-in-out' },
    isOnAir: false,
  },
  {
    id: 'lt-5',
    name: 'Perfil Aluno Destaque',
    template: 'school-profile',
    title: 'LUCAS MENDES',
    subtitle: 'Medalhista de Ouro na Olimpíada de Matemática',
    tag: 'IMPRENSA ASTRO',
    tagColor: '#06d6a0',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    animation: { entryType: 'typewriter', exitType: 'slide', durationMs: 400, easing: 'ease-out' },
    isOnAir: false,
  }
];

// Initial Scoreboards
export const initialScoreboards: ScoreboardData[] = [
  {
    id: 'sb-1',
    name: 'Futsal Interclasses 2026',
    sport: 'futsal',
    layout: 'compact-bug',
    teamA: {
      name: '3º ANO A',
      shortName: '3ºA',
      score: 3,
      color: '#e63946',
      fouls: 2,
      yellowCards: 1,
      redCards: 0
    },
    teamB: {
      name: '3º ANO B',
      shortName: '3ºB',
      score: 2,
      color: '#118ab2',
      fouls: 4,
      yellowCards: 2,
      redCards: 0
    },
    matchTime: {
      minutes: 18,
      seconds: 45,
      isRunning: false,
      period: '2º TEMPO'
    },
    animation: { entryType: 'slide', exitType: 'slide', durationMs: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    isOnAir: false,
  },
  {
    id: 'sb-2',
    name: 'Vôlei Feminino (Barra Inferior)',
    sport: 'volleyball',
    layout: 'bottom-bar',
    teamA: {
      name: 'ENGENHARIA',
      shortName: 'ENG',
      score: 21,
      color: '#ffd166',
      sets: [25, 23, 21]
    },
    teamB: {
      name: 'MEDICINA',
      shortName: 'MED',
      score: 19,
      color: '#06d6a0',
      sets: [22, 25, 19]
    },
    matchTime: {
      minutes: 14,
      seconds: 20,
      isRunning: false,
      period: '3º SET'
    },
    animation: { entryType: 'wipe', exitType: 'wipe', durationMs: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    isOnAir: false,
  },
  {
    id: 'sb-3',
    name: 'Basquete Masculino (Topo Centro)',
    sport: 'basketball',
    layout: 'top-center',
    teamA: {
      name: 'ASTRO ROYALS',
      shortName: 'AST',
      score: 68,
      color: '#7209b7',
      fouls: 3,
    },
    teamB: {
      name: 'METEOR WARRIORS',
      shortName: 'MET',
      score: 65,
      color: '#f72585',
      fouls: 5,
    },
    matchTime: {
      minutes: 3,
      seconds: 12,
      isRunning: false,
      period: '4º QUARTO'
    },
    animation: { entryType: 'scale-bounce', exitType: 'fade', durationMs: 350, easing: 'ease-out' },
    isOnAir: false,
  }
];

// Initial Tickers
export const initialTickers: TickerData[] = [
  {
    id: 'tk-1',
    name: 'Ticker Geral de Notícias',
    speedSeconds: 28,
    direction: 'left',
    isStaticBreaking: false,
    headlineTitle: 'ASTRO NOTÍCIAS',
    items: [
      { id: 't-1', category: 'URGENTE', categoryColor: '#e63946', text: 'Inscrições para o Vestibular Simulado abertas até sexta-feira na secretaria' },
      { id: 't-2', category: 'ESPORTES', categoryColor: '#06d6a0', text: 'Final do Futsal Interclasses acontece amanhã às 15h na Quadra 1' },
      { id: 't-3', category: 'EVENTOS', categoryColor: '#ffd166', text: 'Feira de Ciências e Robótica recebe projetos inovadores de 40 turmas' },
      { id: 't-4', category: 'CLIMA', categoryColor: '#118ab2', text: 'Previsão de sol com pancadas no fim da tarde na capital, máxima de 28°C' },
    ],
    animation: { entryType: 'slide', exitType: 'slide', durationMs: 400, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    isOnAir: false,
  },
  {
    id: 'tk-2',
    name: 'Plantão Alerta Estático (Breaking)',
    speedSeconds: 15,
    direction: 'left',
    isStaticBreaking: true,
    headlineTitle: 'PLANTÃO ASTRO',
    items: [
      { id: 't-b1', category: 'RESULTADO OFICIAL', categoryColor: '#e63946', text: 'CHAPA 1 VENCE AS ELEIÇÕES DO GRÊMIO COM 64% DOS VOTOS' },
      { id: 't-b2', category: 'COMUNICADO', categoryColor: '#ffd166', text: 'Pronunciamento oficial da nova diretoria ao vivo em instantes' }
    ],
    animation: { entryType: 'glitch-in', exitType: 'fade', durationMs: 300, easing: 'ease-in-out' },
    isOnAir: false,
  }
];

// Initial Bugs / Watermarks
export const initialBugs: BugData[] = [
  {
    id: 'bg-1',
    name: 'Logo AstroTv + Ao Vivo (Canto Superior Direito)',
    logoUrl: '/logo.png',
    position: 'top-right',
    scale: 1.0,
    opacity: 0.95,
    showLiveBadge: true,
    liveBadgeText: 'AO VIVO',
    showClock: true,
    clockFormat: '24h',
    showDate: false,
    isOnAir: true,
  },
  {
    id: 'bg-2',
    name: 'Marca d\'Água Transmissão Especial',
    logoUrl: '/logo.png',
    position: 'top-left',
    scale: 0.9,
    opacity: 0.85,
    showLiveBadge: false,
    liveBadgeText: 'EXCLUSIVO',
    showClock: true,
    clockFormat: '24h',
    showDate: true,
    isOnAir: false,
  }
];

// Initial Countdowns
export const initialCountdowns: CountdownData[] = [
  {
    id: 'cd-1',
    name: 'Início da Transmissão (5 min)',
    targetSeconds: 300,
    initialDurationSeconds: 300,
    isRunning: false,
    title: 'A TRANSMISSÃO COMEÇARÁ EM',
    subtitle: 'Prepare-se: Grande Final do Interclasses e Cobertura Especial',
    autoAction: 'stinger',
    animation: { entryType: 'scale-bounce', exitType: 'fade', durationMs: 500, easing: 'ease-out' },
    isOnAir: false,
  },
  {
    id: 'cd-2',
    name: 'Intervalo Rápido (2 min)',
    targetSeconds: 120,
    initialDurationSeconds: 120,
    isRunning: false,
    title: 'VOLTAMOS EM INSTANTES',
    subtitle: 'Intervalo comercial • AstroTv Imprensa',
    autoAction: 'hide',
    animation: { entryType: 'fade', exitType: 'fade', durationMs: 400, easing: 'ease-in-out' },
    isOnAir: false,
  }
];

// Initial Fullscreen Graphics
export const initialFullscreens: FullscreenData[] = [
  {
    id: 'fs-1',
    name: 'Resumo das Eleições do Grêmio',
    template: 'stat-summary',
    title: 'APURAÇÃO FINAL DAS ELEIÇÕES 2026',
    subtitle: 'Total de 1.482 votos computados com auditoria dos representantes',
    category: 'RESULTADO OFICIAL',
    statNumber: '64.2%',
    statLabel: 'Votos válidos para a Chapa Inovação & Voz',
    items: [
      'Chapa 1 (Inovação & Voz): 952 votos (64.2%)',
      'Chapa 2 (União Estudantil): 468 votos (31.6%)',
      'Brancos e Nulos: 62 votos (4.2%)'
    ],
    animation: { entryType: 'slide', exitType: 'fade', durationMs: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    isOnAir: false,
  },
  {
    id: 'fs-2',
    name: 'Agenda da Semana e Feira Cultural',
    template: 'schedule-agenda',
    title: 'CRONOGRAMA DA SEMANA CULTURAL',
    subtitle: 'Confira as atrações e horários de apresentações no teatro',
    category: 'AGENDA DA ESCOLA',
    items: [
      'Segunda 14h: Abertura e Mostra de Fotografia',
      'Terça 10h: Torneio de Xadrez e Robótica',
      'Quarta 15h: Apresentação da Banda Astro Sonora',
      'Quinta 19h: Premiação dos Alunos Destaque 2026'
    ],
    animation: { entryType: 'scale-bounce', exitType: 'slide', durationMs: 400, easing: 'ease-out' },
    isOnAir: false,
  },
  {
    id: 'fs-3',
    name: 'Citação do Diretor Geral',
    template: 'quote-card',
    title: '"O verdadeiro aprendizado acontece quando damos voz e espaço aos nossos estudantes."',
    subtitle: 'Discurso de abertura do ano letivo',
    category: 'PALAVRA DA DIREÇÃO',
    quoteAuthor: 'Prof. Carlos Eduardo Silveira',
    quoteAuthorRole: 'Diretor Geral da Instituição Astro',
    animation: { entryType: 'fade', exitType: 'fade', durationMs: 500, easing: 'ease-in-out' },
    isOnAir: false,
  }
];

// Initial Keyboard Shortcuts
export const defaultShortcuts: KeyboardShortcut[] = [
  { key: '1', action: 'toggle_lt', description: 'Alternar Lower Third no Ar' },
  { key: '2', action: 'toggle_sb', description: 'Alternar Placar no Ar' },
  { key: '3', action: 'toggle_tk', description: 'Alternar Ticker no Ar' },
  { key: '4', action: 'toggle_bg', description: 'Alternar Bug/Logo no Ar' },
  { key: '5', action: 'toggle_cd', description: 'Alternar Contagem Regressiva' },
  { key: '6', action: 'toggle_fs', description: 'Alternar Gráfico Tela Cheia' },
  { key: 'Space', action: 'trigger_transition', description: 'Acionar Vinheta / Transição' },
  { key: 'Escape', action: 'blackout', description: 'BLACKOUT / Limpar Todos os Overlays' },
  { key: 'p', action: 'toggle_timer', description: 'Iniciar / Pausar Cronômetro do Placar' },
  { key: 'a', action: 'inc_score_a', description: 'Gol / Ponto Time A (+1)' },
  { key: 'b', action: 'inc_score_b', description: 'Gol / Ponto Time B (+1)' },
];

export interface BroadcastStoreActions {
  // Global Actions
  setBrandTheme: (theme: Partial<OverlayTheme>) => void;
  setStationName: (name: string) => void;
  setStationLogo: (logoUrl: string) => void;
  toggleAudioMute: () => void;
  toggleBlackout: () => void;
  clearAllOverlays: () => void;

  // Queue / Staging (PGM / PVW)
  setQueuedOverlay: (category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen', data: any) => void;
  executeTransitionToQueued: () => void;

  // Lower Third Actions
  setLowerThirdOnAir: (id: string | null) => void;
  updateLowerThird: (id: string, updates: Partial<LowerThirdData>) => void;
  addLowerThird: (item: LowerThirdData) => void;
  deleteLowerThird: (id: string) => void;
  duplicateLowerThird: (id: string) => void;

  // Scoreboard Actions
  setScoreboardOnAir: (id: string | null) => void;
  updateScoreboard: (id: string, updates: Partial<ScoreboardData>) => void;
  incrementScore: (team: 'teamA' | 'teamB', amount: number) => void;
  toggleScoreboardTimer: () => void;
  resetScoreboardTimer: () => void;
  setScoreboardTime: (minutes: number, seconds: number, period?: string) => void;
  addScoreboard: (item: ScoreboardData) => void;
  deleteScoreboard: (id: string) => void;
  duplicateScoreboard: (id: string) => void;

  // Ticker Actions
  setTickerOnAir: (id: string | null) => void;
  updateTicker: (id: string, updates: Partial<TickerData>) => void;
  addTickerItem: (tickerId: string, item: TickerItem) => void;
  removeTickerItem: (tickerId: string, itemId: string) => void;
  updateTickerItem: (tickerId: string, itemId: string, updates: Partial<TickerItem>) => void;
  reorderTickerItems: (tickerId: string, fromIndex: number, toIndex: number) => void;
  addTicker: (item: TickerData) => void;
  deleteTicker: (id: string) => void;

  // Bug Actions
  setBugOnAir: (id: string | null) => void;
  updateBug: (id: string, updates: Partial<BugData>) => void;
  addBug: (item: BugData) => void;
  deleteBug: (id: string) => void;

  // Countdown Actions
  setCountdownOnAir: (id: string | null) => void;
  updateCountdown: (id: string, updates: Partial<CountdownData>) => void;
  toggleCountdownTimer: () => void;
  resetCountdownTimer: () => void;
  tickCountdown: () => void;
  addCountdown: (item: CountdownData) => void;
  deleteCountdown: (id: string) => void;

  // Fullscreen Actions
  setFullscreenOnAir: (id: string | null) => void;
  updateFullscreen: (id: string, updates: Partial<FullscreenData>) => void;
  addFullscreen: (item: FullscreenData) => void;
  deleteFullscreen: (id: string) => void;
  duplicateFullscreen: (id: string) => void;

  // Transition Actions
  triggerTransition: (type?: TransitionType, sound?: 'whoosh' | 'stinger' | 'glitch' | 'chime' | 'none', durationMs?: number) => void;
  endTransition: () => void;

  // Preset Management
  savePreset: (category: OverlayPreset['category'], name: string, data: any) => void;
  deletePreset: (id: string) => void;
  importPresetsFromJson: (jsonString: string) => boolean;

  // Broadcast sync
  syncStateFromBroadcast: (newState: Partial<BroadcastState>) => void;
}

export type BroadcastStore = BroadcastState & BroadcastStoreActions;

export const useBroadcastStore = create<BroadcastStore>()(
  persist(
    (set, get) => ({
      // State
      activeLowerThird: null,
      activeScoreboard: null,
      activeTicker: null,
      activeBug: initialBugs[0], // Active by default
      activeCountdown: null,
      activeFullscreen: null,
      queuedOverlay: null,
      activeTransition: null,

      brandTheme: defaultBrandTheme,
      stationName: 'ASTRO TV',
      stationLogoUrl: '/logo.png',

      lowerThirds: initialLowerThirds,
      scoreboards: initialScoreboards,
      tickers: initialTickers,
      bugs: initialBugs,
      countdowns: initialCountdowns,
      fullscreens: initialFullscreens,
      savedPresets: [],

      audioMuted: false,
      shortcuts: defaultShortcuts,
      isBlackout: false,

      // Global Actions
      setBrandTheme: (themeUpdates) => {
        set((state) => {
          const newTheme = { ...state.brandTheme, ...themeUpdates };
          broadcastBus.send('STATE_SYNC', { brandTheme: newTheme });
          return { brandTheme: newTheme };
        });
      },

      setStationName: (stationName) => {
        set({ stationName });
        broadcastBus.send('STATE_SYNC', { stationName });
      },

      setStationLogo: (stationLogoUrl) => {
        set({ stationLogoUrl });
        broadcastBus.send('STATE_SYNC', { stationLogoUrl });
      },

      toggleAudioMute: () => {
        set((state) => ({ audioMuted: !state.audioMuted }));
      },

      toggleBlackout: () => {
        set((state) => {
          const newBlackout = !state.isBlackout;
          broadcastBus.send('BLACKOUT_TOGGLE', { isBlackout: newBlackout });
          return { isBlackout: newBlackout };
        });
      },

      clearAllOverlays: () => {
        set({
          activeLowerThird: null,
          activeScoreboard: null,
          activeTicker: null,
          activeBug: null,
          activeCountdown: null,
          activeFullscreen: null,
          isBlackout: false,
        });
        broadcastBus.send('STATE_SYNC', {
          activeLowerThird: null,
          activeScoreboard: null,
          activeTicker: null,
          activeBug: null,
          activeCountdown: null,
          activeFullscreen: null,
          isBlackout: false,
        });
      },

      // Queue & Transition
      setQueuedOverlay: (category, data) => {
        set({ queuedOverlay: data ? { category, data } : null });
      },

      executeTransitionToQueued: () => {
        const { queuedOverlay, triggerTransition } = get();
        if (!queuedOverlay) return;

        triggerTransition('wipe-right', 'whoosh', 400);

        setTimeout(() => {
          const { category, data } = queuedOverlay;
          if (category === 'lowerThird') get().setLowerThirdOnAir(data.id);
          else if (category === 'scoreboard') get().setScoreboardOnAir(data.id);
          else if (category === 'ticker') get().setTickerOnAir(data.id);
          else if (category === 'bug') get().setBugOnAir(data.id);
          else if (category === 'countdown') get().setCountdownOnAir(data.id);
          else if (category === 'fullscreen') get().setFullscreenOnAir(data.id);

          set({ queuedOverlay: null });
        }, 200);
      },

      // Lower Thirds
      setLowerThirdOnAir: (id) => {
        set((state) => {
          if (!id) {
            broadcastBus.send('STATE_SYNC', { activeLowerThird: null });
            return { activeLowerThird: null };
          }
          const item = state.lowerThirds.find((lt) => lt.id === id);
          if (item) {
            const nextItem = { ...item, isOnAir: true };
            broadcastBus.send('STATE_SYNC', { activeLowerThird: nextItem });
            
            // Auto hide timer check
            if (item.animation.autoHideSeconds && item.animation.autoHideSeconds > 0) {
              setTimeout(() => {
                const current = get().activeLowerThird;
                if (current && current.id === item.id) {
                  get().setLowerThirdOnAir(null);
                }
              }, item.animation.autoHideSeconds * 1000);
            }

            return { activeLowerThird: nextItem };
          }
          return { activeLowerThird: null };
        });
      },

      updateLowerThird: (id, updates) => {
        set((state) => {
          const lowerThirds = state.lowerThirds.map((lt) =>
            lt.id === id ? { ...lt, ...updates } : lt
          );
          const activeLowerThird = state.activeLowerThird?.id === id
            ? { ...state.activeLowerThird, ...updates }
            : state.activeLowerThird;

          broadcastBus.send('STATE_SYNC', { activeLowerThird, lowerThirds });
          return { lowerThirds, activeLowerThird };
        });
      },

      addLowerThird: (item) => {
        set((state) => ({ lowerThirds: [item, ...state.lowerThirds] }));
      },

      deleteLowerThird: (id) => {
        set((state) => {
          const lowerThirds = state.lowerThirds.filter((lt) => lt.id !== id);
          const activeLowerThird = state.activeLowerThird?.id === id ? null : state.activeLowerThird;
          broadcastBus.send('STATE_SYNC', { activeLowerThird, lowerThirds });
          return { lowerThirds, activeLowerThird };
        });
      },

      duplicateLowerThird: (id) => {
        const item = get().lowerThirds.find((lt) => lt.id === id);
        if (item) {
          const newItem: LowerThirdData = {
            ...item,
            id: `lt-${Date.now()}`,
            name: `${item.name} (Cópia)`,
            isOnAir: false,
          };
          set((state) => ({ lowerThirds: [newItem, ...state.lowerThirds] }));
        }
      },

      // Scoreboards
      setScoreboardOnAir: (id) => {
        set((state) => {
          if (!id) {
            broadcastBus.send('STATE_SYNC', { activeScoreboard: null });
            return { activeScoreboard: null };
          }
          const item = state.scoreboards.find((sb) => sb.id === id);
          if (item) {
            const nextItem = { ...item, isOnAir: true };
            broadcastBus.send('STATE_SYNC', { activeScoreboard: nextItem });
            return { activeScoreboard: nextItem };
          }
          return { activeScoreboard: null };
        });
      },

      updateScoreboard: (id, updates) => {
        set((state) => {
          const scoreboards = state.scoreboards.map((sb) =>
            sb.id === id ? { ...sb, ...updates } : sb
          );
          const activeScoreboard = state.activeScoreboard?.id === id
            ? { ...state.activeScoreboard, ...updates }
            : state.activeScoreboard;

          broadcastBus.send('STATE_SYNC', { activeScoreboard, scoreboards });
          return { scoreboards, activeScoreboard };
        });
      },

      incrementScore: (team, amount) => {
        const active = get().activeScoreboard;
        if (!active) return;
        const currentScore = active[team].score;
        const newScore = Math.max(0, currentScore + amount);

        // Sound effect on goal/point
        if (amount > 0) {
          broadcastAudio.playSound('chime', undefined, get().audioMuted);
        }

        get().updateScoreboard(active.id, {
          [team]: {
            ...active[team],
            score: newScore,
          },
        });

        broadcastBus.send('UPDATE_SCORE', {
          scoreA: team === 'teamA' ? newScore : active.teamA.score,
          scoreB: team === 'teamB' ? newScore : active.teamB.score,
        });
      },

      toggleScoreboardTimer: () => {
        const active = get().activeScoreboard;
        if (!active) return;
        get().updateScoreboard(active.id, {
          matchTime: {
            ...active.matchTime,
            isRunning: !active.matchTime.isRunning,
          },
        });
      },

      resetScoreboardTimer: () => {
        const active = get().activeScoreboard;
        if (!active) return;
        get().updateScoreboard(active.id, {
          matchTime: {
            ...active.matchTime,
            minutes: 0,
            seconds: 0,
            isRunning: false,
          },
        });
      },

      setScoreboardTime: (minutes, seconds, period) => {
        const active = get().activeScoreboard;
        if (!active) return;
        get().updateScoreboard(active.id, {
          matchTime: {
            ...active.matchTime,
            minutes,
            seconds,
            period: period || active.matchTime.period,
          },
        });
      },

      addScoreboard: (item) => {
        set((state) => ({ scoreboards: [item, ...state.scoreboards] }));
      },

      deleteScoreboard: (id) => {
        set((state) => {
          const scoreboards = state.scoreboards.filter((sb) => sb.id !== id);
          const activeScoreboard = state.activeScoreboard?.id === id ? null : state.activeScoreboard;
          broadcastBus.send('STATE_SYNC', { activeScoreboard, scoreboards });
          return { scoreboards, activeScoreboard };
        });
      },

      duplicateScoreboard: (id) => {
        const item = get().scoreboards.find((sb) => sb.id === id);
        if (item) {
          const newItem: ScoreboardData = {
            ...item,
            id: `sb-${Date.now()}`,
            name: `${item.name} (Cópia)`,
            isOnAir: false,
          };
          set((state) => ({ scoreboards: [newItem, ...state.scoreboards] }));
        }
      },

      // Ticker
      setTickerOnAir: (id) => {
        set((state) => {
          if (!id) {
            broadcastBus.send('STATE_SYNC', { activeTicker: null });
            return { activeTicker: null };
          }
          const item = state.tickers.find((tk) => tk.id === id);
          if (item) {
            const nextItem = { ...item, isOnAir: true };
            broadcastBus.send('STATE_SYNC', { activeTicker: nextItem });
            return { activeTicker: nextItem };
          }
          return { activeTicker: null };
        });
      },

      updateTicker: (id, updates) => {
        set((state) => {
          const tickers = state.tickers.map((tk) =>
            tk.id === id ? { ...tk, ...updates } : tk
          );
          const activeTicker = state.activeTicker?.id === id
            ? { ...state.activeTicker, ...updates }
            : state.activeTicker;

          broadcastBus.send('STATE_SYNC', { activeTicker, tickers });
          return { tickers, activeTicker };
        });
      },

      addTickerItem: (tickerId, item) => {
        const tk = get().tickers.find((t) => t.id === tickerId);
        if (!tk) return;
        const newItems = [...tk.items, item];
        get().updateTicker(tickerId, { items: newItems });
      },

      removeTickerItem: (tickerId, itemId) => {
        const tk = get().tickers.find((t) => t.id === tickerId);
        if (!tk) return;
        const newItems = tk.items.filter((it) => it.id !== itemId);
        get().updateTicker(tickerId, { items: newItems });
      },

      updateTickerItem: (tickerId, itemId, updates) => {
        const tk = get().tickers.find((t) => t.id === tickerId);
        if (!tk) return;
        const newItems = tk.items.map((it) => (it.id === itemId ? { ...it, ...updates } : it));
        get().updateTicker(tickerId, { items: newItems });
      },

      reorderTickerItems: (tickerId, fromIndex, toIndex) => {
        const tk = get().tickers.find((t) => t.id === tickerId);
        if (!tk) return;
        const items = [...tk.items];
        const [moved] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, moved);
        get().updateTicker(tickerId, { items });
      },

      addTicker: (item) => {
        set((state) => ({ tickers: [item, ...state.tickers] }));
      },

      deleteTicker: (id) => {
        set((state) => {
          const tickers = state.tickers.filter((tk) => tk.id !== id);
          const activeTicker = state.activeTicker?.id === id ? null : state.activeTicker;
          broadcastBus.send('STATE_SYNC', { activeTicker, tickers });
          return { tickers, activeTicker };
        });
      },

      // Bug
      setBugOnAir: (id) => {
        set((state) => {
          if (!id) {
            broadcastBus.send('STATE_SYNC', { activeBug: null });
            return { activeBug: null };
          }
          const item = state.bugs.find((bg) => bg.id === id);
          if (item) {
            const nextItem = { ...item, isOnAir: true };
            broadcastBus.send('STATE_SYNC', { activeBug: nextItem });
            return { activeBug: nextItem };
          }
          return { activeBug: null };
        });
      },

      updateBug: (id, updates) => {
        set((state) => {
          const bugs = state.bugs.map((bg) =>
            bg.id === id ? { ...bg, ...updates } : bg
          );
          const activeBug = state.activeBug?.id === id
            ? { ...state.activeBug, ...updates }
            : state.activeBug;

          broadcastBus.send('STATE_SYNC', { activeBug, bugs });
          return { bugs, activeBug };
        });
      },

      addBug: (item) => {
        set((state) => ({ bugs: [item, ...state.bugs] }));
      },

      deleteBug: (id) => {
        set((state) => {
          const bugs = state.bugs.filter((bg) => bg.id !== id);
          const activeBug = state.activeBug?.id === id ? null : state.activeBug;
          broadcastBus.send('STATE_SYNC', { activeBug, bugs });
          return { bugs, activeBug };
        });
      },

      // Countdown
      setCountdownOnAir: (id) => {
        set((state) => {
          if (!id) {
            broadcastBus.send('STATE_SYNC', { activeCountdown: null });
            return { activeCountdown: null };
          }
          const item = state.countdowns.find((cd) => cd.id === id);
          if (item) {
            const nextItem = { ...item, isOnAir: true };
            broadcastBus.send('STATE_SYNC', { activeCountdown: nextItem });
            return { activeCountdown: nextItem };
          }
          return { activeCountdown: null };
        });
      },

      updateCountdown: (id, updates) => {
        set((state) => {
          const countdowns = state.countdowns.map((cd) =>
            cd.id === id ? { ...cd, ...updates } : cd
          );
          const activeCountdown = state.activeCountdown?.id === id
            ? { ...state.activeCountdown, ...updates }
            : state.activeCountdown;

          broadcastBus.send('STATE_SYNC', { activeCountdown, countdowns });
          return { countdowns, activeCountdown };
        });
      },

      toggleCountdownTimer: () => {
        const active = get().activeCountdown;
        if (!active) return;
        get().updateCountdown(active.id, { isRunning: !active.isRunning });
      },

      resetCountdownTimer: () => {
        const active = get().activeCountdown;
        if (!active) return;
        get().updateCountdown(active.id, {
          targetSeconds: active.initialDurationSeconds,
          isRunning: false,
        });
      },

      tickCountdown: () => {
        const active = get().activeCountdown;
        if (!active || !active.isRunning) return;

        if (active.targetSeconds <= 1) {
          // Zero reached
          get().updateCountdown(active.id, { targetSeconds: 0, isRunning: false });
          broadcastAudio.playSound('chime', undefined, get().audioMuted);

          if (active.autoAction === 'hide') {
            get().setCountdownOnAir(null);
          } else if (active.autoAction === 'stinger') {
            get().triggerTransition('wipe-right', 'stinger');
            setTimeout(() => {
              get().setCountdownOnAir(null);
            }, 300);
          }
        } else {
          get().updateCountdown(active.id, { targetSeconds: active.targetSeconds - 1 });
        }
      },

      addCountdown: (item) => {
        set((state) => ({ countdowns: [item, ...state.countdowns] }));
      },

      deleteCountdown: (id) => {
        set((state) => {
          const countdowns = state.countdowns.filter((cd) => cd.id !== id);
          const activeCountdown = state.activeCountdown?.id === id ? null : state.activeCountdown;
          broadcastBus.send('STATE_SYNC', { activeCountdown, countdowns });
          return { countdowns, activeCountdown };
        });
      },

      // Fullscreen
      setFullscreenOnAir: (id) => {
        set((state) => {
          if (!id) {
            broadcastBus.send('STATE_SYNC', { activeFullscreen: null });
            return { activeFullscreen: null };
          }
          const item = state.fullscreens.find((fs) => fs.id === id);
          if (item) {
            const nextItem = { ...item, isOnAir: true };
            broadcastBus.send('STATE_SYNC', { activeFullscreen: nextItem });
            return { activeFullscreen: nextItem };
          }
          return { activeFullscreen: null };
        });
      },

      updateFullscreen: (id, updates) => {
        set((state) => {
          const fullscreens = state.fullscreens.map((fs) =>
            fs.id === id ? { ...fs, ...updates } : fs
          );
          const activeFullscreen = state.activeFullscreen?.id === id
            ? { ...state.activeFullscreen, ...updates }
            : state.activeFullscreen;

          broadcastBus.send('STATE_SYNC', { activeFullscreen, fullscreens });
          return { fullscreens, activeFullscreen };
        });
      },

      addFullscreen: (item) => {
        set((state) => ({ fullscreens: [item, ...state.fullscreens] }));
      },

      deleteFullscreen: (id) => {
        set((state) => {
          const fullscreens = state.fullscreens.filter((fs) => fs.id !== id);
          const activeFullscreen = state.activeFullscreen?.id === id ? null : state.activeFullscreen;
          broadcastBus.send('STATE_SYNC', { activeFullscreen, fullscreens });
          return { fullscreens, activeFullscreen };
        });
      },

      duplicateFullscreen: (id) => {
        const item = get().fullscreens.find((fs) => fs.id === id);
        if (item) {
          const newItem: FullscreenData = {
            ...item,
            id: `fs-${Date.now()}`,
            name: `${item.name} (Cópia)`,
            isOnAir: false,
          };
          set((state) => ({ fullscreens: [newItem, ...state.fullscreens] }));
        }
      },

      // Transitions
      triggerTransition: (type = 'wipe-right', sound = 'whoosh', durationMs = 450) => {
        const transition = {
          isActive: true,
          type,
          durationMs,
          soundEffect: sound,
        };
        broadcastAudio.playSound(sound, undefined, get().audioMuted);
        set({ activeTransition: transition });
        broadcastBus.send('TRIGGER_TRANSITION', transition);

        setTimeout(() => {
          get().endTransition();
        }, durationMs + 100);
      },

      endTransition: () => {
        set({ activeTransition: null });
        broadcastBus.send('STATE_SYNC', { activeTransition: null });
      },

      // Presets
      savePreset: (category, name, data) => {
        const preset: OverlayPreset = {
          id: `preset-${Date.now()}`,
          name,
          category,
          createdAt: new Date().toISOString(),
          data,
        };
        set((state) => ({ savedPresets: [preset, ...state.savedPresets] }));
      },

      deletePreset: (id) => {
        set((state) => ({
          savedPresets: state.savedPresets.filter((p) => p.id !== id),
        }));
      },

      importPresetsFromJson: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (Array.isArray(parsed)) {
            set((state) => ({ savedPresets: [...parsed, ...state.savedPresets] }));
            return true;
          } else if (parsed.savedPresets) {
            set({ ...parsed });
            return true;
          }
          return false;
        } catch (e) {
          console.error('Failed to import JSON presets:', e);
          return false;
        }
      },

      // Broadcast Sync listener update
      syncStateFromBroadcast: (newState) => {
        set((state) => ({ ...state, ...newState }));
      },
    }),
    {
      name: 'astrotv_broadcast_suite_v1',
      partialize: (state) => ({
        brandTheme: state.brandTheme,
        stationName: state.stationName,
        stationLogoUrl: state.stationLogoUrl,
        lowerThirds: state.lowerThirds,
        scoreboards: state.scoreboards,
        tickers: state.tickers,
        bugs: state.bugs,
        countdowns: state.countdowns,
        fullscreens: state.fullscreens,
        savedPresets: state.savedPresets,
        shortcuts: state.shortcuts,
        audioMuted: state.audioMuted,
      }),
    }
  )
);

// Listen to handshake requests from OBS Studio Browser Source
if (typeof window !== 'undefined') {
  broadcastBus.subscribe((msg) => {
    if (msg.type === 'REQUEST_CURRENT_STATE') {
      const state = useBroadcastStore.getState();
      broadcastBus.send('STATE_SYNC', {
        activeLowerThird: state.activeLowerThird,
        activeScoreboard: state.activeScoreboard,
        activeTicker: state.activeTicker,
        activeBug: state.activeBug,
        activeCountdown: state.activeCountdown,
        activeFullscreen: state.activeFullscreen,
        brandTheme: state.brandTheme,
        stationName: state.stationName,
        isBlackout: state.isBlackout,
      });
    }
  });
}

