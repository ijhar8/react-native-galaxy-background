/**
 * @module VideoBackground
 * @description Strict TypeScript type definitions for the VideoBackground component system.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────┐
 * │  VideoPoolProvider (optional, app root)                 │
 * │  ├── PreloadSlot[0] → useVideoPlayer (pre-warms decoder)│
 * │  ├── PreloadSlot[1] → useVideoPlayer (pre-warms decoder)│
 * │  └── App Navigation Tree                                │
 * │       └── Screen                                        │
 * │            └── VideoBackground                          │
 * │                 ├── <VideoView> (native GPU layer)       │
 * │                 ├── <Animated.Image> (poster cross-fade) │
 * │                 └── <View pointerEvents="box-none">     │
 * │                      └── {children}                     │
 * └─────────────────────────────────────────────────────────┘
 */

import type { ReactNode } from 'react';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import type { VideoSource, VideoPlayer } from 'expo-video';

// ─── Player Status ───────────────────────────────────────────────────────────

/** Native video player lifecycle states from expo-video's `statusChange` event. */
export type VideoPlayerStatus = 'idle' | 'loading' | 'readyToPlay' | 'error';

// ─── Content Fit ─────────────────────────────────────────────────────────────

/**
 * How video content fits within the view bounds.
 * Maps directly to expo-video `VideoView.contentFit` and RN `Image.resizeMode`.
 *
 * - `'cover'`   — Scale to fill, cropping edges (most common for backgrounds).
 * - `'contain'` — Scale to fit entirely within bounds (letterboxed).
 * - `'fill'`    — Stretch to fill without preserving aspect ratio.
 */
export type VideoContentFit = 'cover' | 'contain' | 'fill';

// ─── VideoBackground Props ───────────────────────────────────────────────────

export interface VideoBackgroundProps {
  /**
   * Video asset source. Accepts `require('./video.mp4')` for bundled assets
   * or a string URI for remote videos.
   *
   * **Performance**: Bundled assets (`require()`) skip network I/O entirely —
   * the native decoder reads directly from the app binary (~100ms vs ~2-5s).
   */
  source: VideoSource;

  /**
   * Static image shown instantly while the native video decoder initializes.
   * Cross-fades out via Reanimated when the player reaches `readyToPlay`.
   *
   * **Tip**: Use the video's first frame exported as `.webp` for a seamless,
   * invisible transition. Extract with:
   * ```bash
   * ffmpeg -i video.mp4 -frames:v 1 -q:v 2 poster.webp
   * ```
   */
  posterSource?: ImageSourcePropType;

  /** Loop playback continuously. Default: `true`. */
  isLooping?: boolean;

  /** Mute audio track. Default: `true` (background videos should be silent). */
  isMuted?: boolean;

  /**
   * How video content fits within the view bounds.
   * - `'cover'` (default) — Scale to fill, cropping edges.
   * - `'contain'` — Letterboxed fit.
   * - `'fill'` — Stretch to fill.
   */
  contentFit?: VideoContentFit;

  /**
   * Duration in milliseconds for the poster → video cross-fade.
   * Uses `Easing.out(Easing.cubic)` for a natural deceleration curve.
   * Default: `600`.
   */
  fadeDuration?: number;

  /**
   * Screen focus state from React Navigation's `useIsFocused()`.
   * When `false`, playback is paused to conserve battery and free the
   * hardware decoder for other screens. When `true`, playback resumes.
   *
   * **Usage**:
   * ```tsx
   * import { useIsFocused } from '@react-navigation/native';
   * <VideoBackground isFocused={useIsFocused()} source={...} />
   * ```
   *
   * Default: `true` (always playing, for non-navigation apps).
   */
  isFocused?: boolean;

  /** Start playback immediately on mount. Default: `true`. */
  autoPlay?: boolean;

  /**
   * Release the native video player when playback completes (`playToEnd`).
   * Frees ~25-45 MB of native decoder memory — critical on low-end devices.
   * Only meaningful when `isLooping` is `false`.
   * Default: `false`.
   */
  autoRelease?: boolean;

  /**
   * Optional pool key. When a `VideoPoolProvider` ancestor has pre-warmed
   * a player with this key, the component reuses that player instance
   * instead of creating a new one. Eliminates decoder warmup latency
   * entirely (~0ms vs ~500-900ms on low-end Android).
   */
  poolKey?: string;

  // ─── Callbacks ───────────────────────────────────────────────────────────

  /** Fires when the native decoder finishes initialization and the first frame is available. */
  onReadyToPlay?: () => void;

  /**
   * Fires when non-looping playback reaches the end of the video.
   * Use this to trigger navigation transitions after a splash video completes.
   */
  onPlaybackComplete?: () => void;

  /** Fires when the native decoder encounters an unrecoverable error. */
  onError?: (error: string) => void;

  // ─── Layout ──────────────────────────────────────────────────────────────

  /** Container style. Defaults to `{ flex: 1 }`. */
  style?: StyleProp<ViewStyle>;

  /**
   * Foreground UI elements rendered above the video layer.
   * Wrapped in `pointerEvents="box-none"` for full touch interactivity.
   */
  children?: ReactNode;
}

// ─── Video Pool Provider ─────────────────────────────────────────────────────

/**
 * A single entry in the `VideoPoolProvider.preload` array.
 * Each entry pre-warms a native video decoder at app startup.
 */
export interface PreloadEntry {
  /** Unique key to retrieve this player later via `useVideoPool().get(key)`. */
  key: string;

  /** Video source to pre-warm (same format as `VideoBackgroundProps.source`). */
  source: VideoSource;
}

/**
 * Context value exposed by `useVideoPool()`.
 * Provides read-only access to pre-warmed video player instances.
 */
export interface VideoPoolContextValue {
  /**
   * Retrieve a pre-warmed VideoPlayer by its registration key.
   * Returns `undefined` if the key was not registered in `preload`.
   */
  get: (key: string) => VideoPlayer | undefined;

  /** Check whether a player is registered under the given key. */
  has: (key: string) => boolean;
}

/** Props for the `VideoPoolProvider` component. */
export interface VideoPoolProviderProps {
  /**
   * Array of video sources to pre-warm at provider mount.
   * Each entry creates a native video player that begins decoding immediately,
   * so when a `VideoBackground` with matching `poolKey` mounts, playback starts
   * with zero decoder warmup latency.
   *
   * **Memory**: Each pre-warmed 720p H.264 player consumes ~25-40 MB of native
   * memory. Pre-warm only videos that the user will definitely see.
   */
  preload?: PreloadEntry[];

  children: ReactNode;
}
