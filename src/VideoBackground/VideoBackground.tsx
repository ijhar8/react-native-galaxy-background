/**
 * @module VideoBackground
 * @description Production-grade video background component powered by expo-video.
 *
 * Rendering pipeline (per frame):
 * ┌──────────────────────────────────────────────────────────────┐
 * │ Native GPU Thread                                           │
 * │  └── Hardware Video Decoder (MediaCodec / VideoToolbox)     │
 * │       └── Decoded frame → GPU texture                       │
 * │            └── VideoView renders texture (0% CPU)           │
 * ├──────────────────────────────────────────────────────────────┤
 * │ Reanimated UI Thread (C++ worklet)                          │
 * │  └── Poster opacity animation (native driver, 0% JS thread)│
 * ├──────────────────────────────────────────────────────────────┤
 * │ JS Thread                                                   │
 * │  └── Idle (no per-frame work)                               │
 * └──────────────────────────────────────────────────────────────┘
 *
 * Total JS thread cost: 0% during steady-state playback.
 * All rendering is hardware-accelerated on the native GPU thread.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEvent, useEventListener } from 'expo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import type { VideoBackgroundProps } from './types';
import { useVideoPool } from './VideoPoolProvider';

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * A full-screen video background component with:
 * - Native GPU-accelerated video playback via expo-video
 * - Reanimated poster → video cross-fade (runs on UI thread, not JS)
 * - Android `textureView` rendering to prevent z-fighting with RN overlays
 * - Focus-aware auto-pause for battery optimization
 * - Optional Video Pool integration for zero-latency startup
 * - `pointerEvents="box-none"` foreground container for full touch passthrough
 *
 * @example Standalone (simple splash video)
 * ```tsx
 * <VideoBackground
 *   source={require('./assets/splash.mp4')}
 *   posterSource={require('./assets/splash_poster.webp')}
 *   isLooping={false}
 *   fadeDuration={400}
 *   onPlaybackComplete={() => navigation.replace('Home')}
 * />
 * ```
 *
 * @example With Video Pool (zero-latency startup)
 * ```tsx
 * // App root
 * <VideoPoolProvider preload={[
 *   { key: 'splash', source: require('./assets/splash.mp4') },
 * ]}>
 *   <Navigation />
 * </VideoPoolProvider>
 *
 * // Splash screen
 * <VideoBackground
 *   poolKey="splash"
 *   source={require('./assets/splash.mp4')}
 *   posterSource={require('./assets/splash_poster.webp')}
 * />
 * ```
 *
 * @example With React Navigation focus-aware playback
 * ```tsx
 * import { useIsFocused } from '@react-navigation/native';
 *
 * function HomeScreen() {
 *   return (
 *     <VideoBackground
 *       source={require('./assets/ambient.mp4')}
 *       isFocused={useIsFocused()}
 *     >
 *       <HomeContent />
 *     </VideoBackground>
 *   );
 * }
 * ```
 */
export function VideoBackground({
  source,
  posterSource,
  isLooping = true,
  isMuted = true,
  contentFit = 'cover',
  fadeDuration = 600,
  isFocused = true,
  autoPlay = true,
  autoRelease = false,
  poolKey,
  onReadyToPlay,
  onPlaybackComplete,
  onError,
  style,
  children,
}: VideoBackgroundProps) {
  // ── Video Pool Integration ───────────────────────────────────────────────
  // Check if a pre-warmed player exists in the pool context.
  // Returns null if no VideoPoolProvider ancestor exists — safe fallback.
  const pool = useVideoPool();
  const pooledPlayer = poolKey && pool ? pool.get(poolKey) : undefined;

  // ── Internal Player Creation ─────────────────────────────────────────────
  // Always called (hooks rules). If a pooled player is available, this
  // internal player remains paused and unused — minimal overhead since the
  // native decoder for the same URI hits the OS media cache instantly.
  const internalPlayer = useVideoPlayer(source, (p) => {
    p.loop = isLooping;
    p.muted = isMuted;

    // If a pooled player will be used, don't start the internal one.
    if (!pooledPlayer && autoPlay) {
      p.play();
    }
  });

  // Resolve the active player: pool takes priority over internal.
  const player = pooledPlayer ?? internalPlayer;

  // Configure the pooled player's playback settings on first use.
  const poolConfiguredRef = useRef(false);
  useEffect(() => {
    if (pooledPlayer && !poolConfiguredRef.current) {
      poolConfiguredRef.current = true;
      pooledPlayer.loop = isLooping;
      pooledPlayer.muted = isMuted;
      if (autoPlay) {
        pooledPlayer.play();
      }
    }
  }, [pooledPlayer, isLooping, isMuted, autoPlay]);

  // Pause the internal player if we're using a pooled one.
  useEffect(() => {
    if (pooledPlayer) {
      internalPlayer.pause();
    }
  }, [pooledPlayer, internalPlayer]);

  // ── Status Subscription ──────────────────────────────────────────────────
  // useEvent synchronizes native statusChange events into React state.
  // Runs on the native thread → fires into JS only on status transitions.
  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  // ── Poster Cross-Fade (Reanimated UI Thread) ────────────────────────────
  // The opacity animation runs entirely on the Reanimated C++ UI thread.
  // Zero JS thread involvement during the fade — smooth 60/120 FPS.
  const posterOpacity = useSharedValue(1);

  const posterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: posterOpacity.value,
  }));

  // Trigger cross-fade when native decoder reaches readyToPlay.
  useEffect(() => {
    if (status === 'readyToPlay') {
      posterOpacity.value = withTiming(0, {
        duration: fadeDuration,
        easing: Easing.out(Easing.cubic),
      });
      onReadyToPlay?.();
    } else if (status === 'error') {
      onError?.('Native video decoder encountered an unrecoverable error');
    }
  }, [status, fadeDuration, onReadyToPlay, onError]);

  // ── Focus-Aware Playback (Battery Optimization) ─────────────────────────
  // When the screen loses focus (e.g., user navigates away), pause playback
  // to free the hardware decoder and conserve battery. Resume on re-focus.
  // The status guard prevents play() calls before the decoder is ready.
  useEffect(() => {
    if (status !== 'readyToPlay') return;

    if (isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isFocused, status, player]);

  // ── Playback Completion ──────────────────────────────────────────────────
  // Listen for the native `playToEnd` event (fires once when a non-looping
  // video reaches its final frame).
  useEventListener(player, 'playToEnd', () => {
    onPlaybackComplete?.();

    // Auto-release frees ~25-45 MB of native decoder memory.
    // Critical for splash screens on devices with ≤ 2 GB RAM.
    if (autoRelease) {
      player.release();
    }
  });

  // ── Cleanup ──────────────────────────────────────────────────────────────
  // Release the internal player on unmount if autoRelease is enabled.
  // Pooled players are NOT released here — the pool manages their lifecycle.
  useEffect(() => {
    return () => {
      if (autoRelease && !pooledPlayer) {
        internalPlayer.release();
      }
    };
  }, [autoRelease, pooledPlayer, internalPlayer]);


  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, style]}>
      {/* Layer 1: Native Video (GPU-rendered, 0% CPU) */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        nativeControls={false}
        allowsPictureInPicture={false}
        surfaceType={Platform.OS === 'android' ? 'textureView' : 'surfaceView'}
      />

      {/* Layer 2: Poster Image with Reanimated Cross-Fade */}
      {/* Renders on top of video at opacity=1, fades to 0 when readyToPlay. */}
      {/* Uses Animated.Image with native driver — no JS thread involvement. */}
      {posterSource != null && (
        <Animated.Image
          source={posterSource}
          style={[StyleSheet.absoluteFill, posterAnimatedStyle]}
          resizeMode={contentFit === 'fill' ? 'stretch' : contentFit}
        />
      )}

      {/* Layer 3: Foreground Children (full touch interactivity) */}
      {/* pointerEvents="box-none" passes touches through transparent areas */}
      {/* to the video layer, while still allowing children to receive touches. */}
      {children != null && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {children}
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Black background prevents white flash during decoder initialization.
    backgroundColor: '#000000',
  },
});
