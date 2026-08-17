export type AnimationType = 
  | 'slide' 
  | 'wipe' 
  | 'fade' 
  | 'glitch-in' 
  | 'typewriter' 
  | 'scale-bounce'
  | 'blade-sweep'
  | 'curtain-reveal'
  | 'elastic-snap'
  | 'flip-unfold'
  | 'headline-shutter'
  | 'neon-flare'
  | 'smooth-glide';

export type ExitAnimationType = 
  | 'exit-slide-left'
  | 'exit-slide-down'
  | 'exit-blade-retract'
  | 'exit-fade-blur'
  | 'exit-glitch-dissolve'
  | 'exit-3d-fold'
  | 'exit-elastic-collapse';

export type EasingType = 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'linear' 
  | 'cubic-bezier(0.16, 1, 0.3, 1)'
  | 'cubic-bezier(0.05, 0.9, 0.1, 1.05)'
  | 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';

export type SportType = 'futsal' | 'volleyball' | 'basketball' | 'generic';

export type ScoreboardLayout = 'compact-bug' | 'bottom-bar' | 'top-center';

export type LowerThirdTemplate = 
  | 'standard-news' 
  | 'interview-avatar' 
  | 'quote' 
  | 'breaking-bar' 
  | 'modern-minimal' 
  | 'school-profile';

export type FullscreenTemplate = 
  | 'stat-summary' 
  | 'quote-card' 
  | 'schedule-agenda' 
  | 'breaking-fullscreen' 
  | 'interviewee-spotlight';

export type TransitionType = 
  | 'wipe-right' 
  | 'glitch-wipe' 
  | 'zoom-blur' 
  | 'logo-stinger' 
  | 'circle-iris'
  | 'blade-stinger'
  | 'shutter-split'
  | 'cyber-shockwave';

export type BugPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'custom';

export interface OverlayTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  subtextColor: string;
  fontFamily: string;
  titleFontFamily: string;
  borderRadius: number;
  glassOpacity: number;
  enableGlow: boolean;
}

export interface AnimationSettings {
  entryType: AnimationType;
  exitType: AnimationType;
  durationMs: number;
  easing: EasingType;
  autoHideSeconds?: number; // 0 or undefined for manual
}

export interface LowerThirdData {
  id: string;
  name: string;
  template: LowerThirdTemplate;
  title: string;
  subtitle: string;
  tag?: string;
  tagColor?: string;
  avatarUrl?: string;
  customTheme?: Partial<OverlayTheme>;
  animation: AnimationSettings;
  isOnAir: boolean;
}

export interface ScoreboardData {
  id: string;
  name: string;
  sport: SportType;
  layout: ScoreboardLayout;
  teamA: {
    name: string;
    shortName: string;
    score: number;
    color: string;
    logoUrl?: string;
    fouls?: number;
    yellowCards?: number;
    redCards?: number;
    sets?: number[];
  };
  teamB: {
    name: string;
    shortName: string;
    score: number;
    color: string;
    logoUrl?: string;
    fouls?: number;
    yellowCards?: number;
    redCards?: number;
    sets?: number[];
  };
  matchTime: {
    minutes: number;
    seconds: number;
    isRunning: boolean;
    period: string; // e.g. "1º TEMPO", "2º TEMPO", "Q1", "SET 2"
  };
  customTheme?: Partial<OverlayTheme>;
  animation: AnimationSettings;
  isOnAir: boolean;
}

export interface TickerItem {
  id: string;
  category: string;
  categoryColor: string;
  text: string;
}

export interface TickerData {
  id: string;
  name: string;
  items: TickerItem[];
  speedSeconds: number; // Duration of one full loop
  direction: 'left' | 'right';
  isStaticBreaking: boolean; // Static flashing breaking news variant
  headlineTitle?: string;
  customTheme?: Partial<OverlayTheme>;
  animation: AnimationSettings;
  isOnAir: boolean;
}

export interface BugData {
  id: string;
  name: string;
  logoUrl: string;
  position: BugPosition;
  customX?: number; // percentage from left
  customY?: number; // percentage from top
  scale: number; // 0.5 to 2.0
  opacity: number; // 0.1 to 1.0
  showLiveBadge: boolean;
  liveBadgeText: string;
  showClock: boolean;
  clockFormat: '24h' | '12h';
  showDate: boolean;
  customTheme?: Partial<OverlayTheme>;
  isOnAir: boolean;
}

export interface CountdownData {
  id: string;
  name: string;
  targetSeconds: number; // remaining seconds
  initialDurationSeconds: number;
  isRunning: boolean;
  title: string;
  subtitle: string;
  autoAction: 'none' | 'hide' | 'stinger' | 'fullscreen';
  customTheme?: Partial<OverlayTheme>;
  animation: AnimationSettings;
  isOnAir: boolean;
}

export interface FullscreenData {
  id: string;
  name: string;
  template: FullscreenTemplate;
  title: string;
  subtitle: string;
  category: string;
  items?: string[];
  statNumber?: string;
  statLabel?: string;
  quoteAuthor?: string;
  quoteAuthorRole?: string;
  imageUrl?: string;
  customTheme?: Partial<OverlayTheme>;
  animation: AnimationSettings;
  isOnAir: boolean;
}

export interface TransitionState {
  isActive: boolean;
  type: TransitionType;
  durationMs: number;
  soundEffect: 'whoosh' | 'stinger' | 'glitch' | 'chime' | 'none';
  soundUrl?: string;
  logoUrl?: string;
}

export interface OverlayPreset {
  id: string;
  name: string;
  category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen';
  createdAt: string;
  data: LowerThirdData | ScoreboardData | TickerData | BugData | CountdownData | FullscreenData;
}

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
  overlayId?: string;
}

export interface BroadcastState {
  // Global On-Air states
  activeLowerThird: LowerThirdData | null;
  activeScoreboard: ScoreboardData | null;
  activeTicker: TickerData | null;
  activeBug: BugData | null;
  activeCountdown: CountdownData | null;
  activeFullscreen: FullscreenData | null;
  
  // Staging / Preview Queue
  queuedOverlay: {
    category: 'lowerThird' | 'scoreboard' | 'ticker' | 'bug' | 'countdown' | 'fullscreen';
    data: any;
  } | null;

  // Active Transition
  activeTransition: TransitionState | null;

  // Global Theme & Brand
  brandTheme: OverlayTheme;
  stationName: string;
  stationLogoUrl: string;

  // Preset Collections
  lowerThirds: LowerThirdData[];
  scoreboards: ScoreboardData[];
  tickers: TickerData[];
  bugs: BugData[];
  countdowns: CountdownData[];
  fullscreens: FullscreenData[];
  savedPresets: OverlayPreset[];

  // Settings
  audioMuted: boolean;
  shortcuts: KeyboardShortcut[];
  isBlackout: boolean;
}
