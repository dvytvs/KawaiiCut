
export enum AssetType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  TEXT = 'TEXT',
  EFFECT = 'EFFECT'
}

export enum EffectType {
  SNOW = 'SNOW',
  LEAVES = 'LEAVES',
  RAIN = 'RAIN',
  VHS = 'VHS',
  BLUR = 'BLUR',
  SEPIA = 'SEPIA',
  FLASH = 'FLASH',
  INVERT = 'INVERT',
  FRAME = 'FRAME',
  SUNRISE = 'SUNRISE',
  FADE_OUT = 'FADE_OUT',
  SHAKE = 'SHAKE',
  STARS = 'STARS'
}

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3';
export type Language = 'ru' | 'en';
export type Theme = 'light' | 'neon' | 'dark';

export interface UserProfile {
  name: string;
  surname: string;
  avatar: string; // URL or base64
}

export interface AppSettings {
  language: Language;
  theme: Theme;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  src: string; // For text, this can be empty or a preview image
  thumbnail?: string;
  duration: number; // in seconds
  effectType?: EffectType;
}

export interface TextData {
  content: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  align: 'left' | 'center' | 'right';
  isBold?: boolean;
  isItalic?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  outlineColor?: string;
  outlineWidth?: number;
}

export interface Clip {
  id: string;
  assetId: string;
  trackId: string;
  startTime: number; // Start time on timeline (seconds)
  duration: number; // Duration of the clip (seconds)
  offset: number; // Start time within the source asset (trimming)
  
  // Visual Properties
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  mirror: boolean;
  speed: number; // New: Playback speed (1.0 is normal)
  
  // Specific Data
  textData?: TextData;
  effectType?: EffectType;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio';
  isMuted: boolean;
  isLocked: boolean;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  lastModified: Date;
  thumbnail?: string;
  isDeleted?: boolean;
}

export interface ProjectState {
  meta: ProjectMetadata;
  assets: Asset[];
  tracks: Track[];
  clips: Clip[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  zoom: number;
}
