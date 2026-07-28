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
  const pool = useVideoPool();
  const pooledPlayer = poolKey && pool ? pool.get(poolKey) : undefined;

  // ── Internal Player Creation ─────────────────────────────────────────────
  const internalPlayer = useVideoPlayer(source, (p) => {
    p.loop = isLooping;
    p.muted = isMuted;

    if (!pooledPlayer && autoPlay) {
      p.play();
    }
  });

  // Resolve active player
  const player = pooledPlayer ?? internalPlayer;

  // Configure pooled player settings on mount
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

  // Pause internal player if using pooled player
  useEffect(() => {
    if (pooledPlayer) {
      internalPlayer.pause();
    }
  }, [pooledPlayer, internalPlayer]);

  // ── Sync Props ───────────────────────────────────────────────────────────
  useEffect(() => {
    player.loop = isLooping;
    player.muted = isMuted;
  }, [player, isLooping, isMuted]);

  // ── Status Subscription ──────────────────────────────────────────────────
  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });

  // ── Poster Cross-Fade (Reanimated UI Thread) ────────────────────────────
  const posterOpacity = useSharedValue(1);

  const posterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: posterOpacity.value,
  }));

  // Trigger cross-fade and start playback when readyToPlay
  useEffect(() => {
    const isReady = status === 'readyToPlay' || player.status === 'readyToPlay';
    if (isReady) {
      posterOpacity.value = withTiming(0, {
        duration: fadeDuration,
        easing: Easing.out(Easing.cubic),
      });
      if (autoPlay && isFocused) {
        player.play();
      }
      onReadyToPlay?.();
    } else if (status === 'error') {
      onError?.('Native video decoder encountered an unrecoverable error');
    }
  }, [status, player, fadeDuration, autoPlay, isFocused, onReadyToPlay, onError]);

  // ── Focus-Aware Playback ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isFocused) {
      player.pause();
      return;
    }

    if (autoPlay) {
      player.play();
    }
  }, [isFocused, autoPlay, player, status]);

  // ── Playback Completion ──────────────────────────────────────────────────
  useEventListener(player, 'playToEnd', () => {
    onPlaybackComplete?.();

    if (autoRelease) {
      player.release();
    }
  });

  // ── Cleanup ──────────────────────────────────────────────────────────────
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
      {posterSource != null && (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, posterAnimatedStyle]}
        >
          <Animated.Image
            source={posterSource}
            style={StyleSheet.absoluteFill}
            resizeMode={contentFit === 'fill' ? 'stretch' : contentFit}
          />
        </Animated.View>
      )}

      {/* Layer 3: Foreground Children (full touch interactivity) */}
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
    backgroundColor: '#000000',
  },
});
