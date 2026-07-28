/**
 * @module VideoPoolProvider
 * @description Global Video Player Pool for pre-warming native video decoders.
 *
 * Problem:
 *   On low-end Android, creating a new VideoPlayer and decoding the first frame
 *   takes 500-900ms. During this window, the user sees either a black frame
 *   or an abrupt poster → video pop.
 *
 * Solution:
 *   Mount `<VideoPoolProvider preload={[...]}> ` at the app root. This creates
 *   native VideoPlayer instances *before* any screen mounts, so by the time
 *   `<VideoBackground poolKey="splash">` renders, the decoder is already in
 *   `readyToPlay` state → immediate playback, zero black frames.
 *
 * Memory budget:
 *   Each pre-warmed 720p H.264 player ≈ 25-40 MB native heap.
 *   Pre-warm only videos the user will definitely see within seconds.
 *
 * Usage:
 * ```tsx
 * // App.tsx (root)
 * <VideoPoolProvider preload={[
 *   { key: 'splash', source: require('./assets/splash.mp4') },
 *   { key: 'onboarding', source: require('./assets/onboarding.mp4') },
 * ]}>
 *   <NavigationContainer>
 *     <Stack.Navigator>...</Stack.Navigator>
 *   </NavigationContainer>
 * </VideoPoolProvider>
 *
 * // SplashScreen.tsx
 * <VideoBackground poolKey="splash" source={require('./assets/splash.mp4')} />
 * ```
 */

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  memo,
} from 'react';
import { useVideoPlayer } from 'expo-video';
import type { VideoPlayer } from 'expo-video';
import type {
  VideoPoolContextValue,
  VideoPoolProviderProps,
  PreloadEntry,
} from './types';

// ─── Context ─────────────────────────────────────────────────────────────────

const VideoPoolContext = createContext<VideoPoolContextValue | null>(null);

// ─── PreloadSlot (Internal) ──────────────────────────────────────────────────

/**
 * Hidden component that creates a single native VideoPlayer via `useVideoPlayer`
 * and registers it in the pool's Map. Renders no visual output.
 *
 * Each slot runs the native decoder initialization on the platform's media thread
 * (MediaCodec on Android, VideoToolbox on iOS) — zero JS thread blocking.
 *
 * @internal Not exported. Used only by VideoPoolProvider.
 */
const PreloadSlot = memo(function PreloadSlot({
  entry,
  onRegister,
}: {
  entry: PreloadEntry;
  onRegister: (key: string, player: VideoPlayer) => void;
}) {
  const player = useVideoPlayer(entry.source, (p) => {
    // Pre-warmed players are muted and paused by default.
    // The consuming VideoBackground will configure playback state.
    p.muted = true;
    p.loop = false;
  });

  useEffect(() => {
    onRegister(entry.key, player);
  }, [entry.key, player, onRegister]);

  // No visual output — only warms the native decoder pipeline.
  return null;
});

// ─── VideoPoolProvider ───────────────────────────────────────────────────────

/**
 * Global Video Player Pool Provider.
 *
 * Wrap your app root with this component and pass a `preload` array to
 * pre-warm native video decoders. When a `<VideoBackground poolKey="..."/>`
 * mounts, it retrieves the pre-warmed player from this context, skipping
 * the 500-900ms decoder initialization entirely.
 *
 * This component is **optional**. `<VideoBackground>` works standalone
 * without a pool — it creates its own player internally.
 */
export function VideoPoolProvider({
  preload = [],
  children,
}: VideoPoolProviderProps) {
  // Stable Map ref — never causes re-renders when players register.
  const poolRef = useRef<Map<string, VideoPlayer>>(new Map());

  const handleRegister = useCallback(
    (key: string, player: VideoPlayer) => {
      poolRef.current.set(key, player);
    },
    []
  );

  const get = useCallback(
    (key: string): VideoPlayer | undefined => poolRef.current.get(key),
    []
  );

  const has = useCallback(
    (key: string): boolean => poolRef.current.has(key),
    []
  );

  // Stable context value — avoids unnecessary consumer re-renders.
  const contextValue = useRef<VideoPoolContextValue>({ get, has }).current;

  return (
    <VideoPoolContext.Provider value={contextValue}>
      {preload.map((entry) => (
        <PreloadSlot
          key={entry.key}
          entry={entry}
          onRegister={handleRegister}
        />
      ))}
      {children}
    </VideoPoolContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Access the Video Pool context from any descendant component.
 *
 * Returns `null` if no `<VideoPoolProvider>` ancestor exists —
 * callers must handle this gracefully (which `VideoBackground` does
 * automatically by falling back to its internal player).
 */
export function useVideoPool(): VideoPoolContextValue | null {
  return useContext(VideoPoolContext);
}
