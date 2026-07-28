/**
 * @module VideoBackground
 * @description Barrel export for the VideoBackground component system.
 *
 * Exports:
 * - `VideoBackground`     — Core full-screen video background component.
 * - `VideoPoolProvider`    — Optional global provider for pre-warming video decoders.
 * - `useVideoPool`         — Hook to access pooled video players from any descendant.
 * - Type definitions       — Full TypeScript interfaces for all props and configs.
 */

// ── Components ─────────────────────────────────────────────────────────────

export { VideoBackground } from './VideoBackground';
export { VideoPoolProvider, useVideoPool } from './VideoPoolProvider';

// ── Types ──────────────────────────────────────────────────────────────────

export type {
  VideoBackgroundProps,
  VideoPoolProviderProps,
  VideoPoolContextValue,
  PreloadEntry,
  VideoPlayerStatus,
  VideoContentFit,
} from './types';
