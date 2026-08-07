import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';

// ── Galaxy Background (Skia particles) ──
import GalaxyBackgroundView, {
  GalaxyDirection,
  GalaxyZoom,
  GalaxyTheme,
} from './GalaxyBackgroundView';

// ── Video Background (expo-video) ──
import { VideoBackground } from './VideoBackground';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Demo Mode ─────────────────────────────────────────────────────────────

type DemoMode = 'galaxy' | 'video';

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<DemoMode>('galaxy');

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {mode === 'galaxy' ? (
        <GalaxyDemo onSwitchMode={() => setMode('video')} />
      ) : (
        <VideoDemo onSwitchMode={() => setMode('galaxy')} />
      )}
    </>
  );
}

// ─── Video Background Demo ─────────────────────────────────────────────────

function VideoDemo({ onSwitchMode }: { onSwitchMode: () => void }) {
  const [isReady, setIsReady] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const handleReady = useCallback(() => {
    setIsReady(true);
  }, []);

  return (
    <VideoBackground
      source={require('./assets/deep_space.mp4')}
      posterSource={require('./assets/deep_space_poster.jpg')}
      isLooping={isLooping}
      isMuted={true}
      contentFit="cover"
      fadeDuration={800}
      onReadyToPlay={handleReady}
      style={styles.container}
    >
      <View style={styles.screen}>
        {/* ── Top Header ── */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.topHeader}>
          <Text style={styles.libraryTag}>EXPO-VIDEO POWERED</Text>
          <Text style={styles.libraryTitle}>Video Background</Text>
          {isReady && (
            <Animated.View entering={FadeIn.delay(200).duration(400)}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>GPU Playback Active</Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Center Feature Card ── */}
        <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.heroCard}>
          <Text style={styles.heroBadge}>🎬 Hardware Decoded • 0% CPU</Text>
          <Text style={styles.heroTitle}>Deep Space Video</Text>
          <Text style={styles.heroSubtitle}>
            Native GPU video playback with Reanimated poster cross-fade, Android
            TextureView z-fighting fix, and focus-aware battery optimization.
          </Text>

          {/* Loop Mode Control */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Loop Playback</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsLooping(false)}
                style={[styles.pillBtn, !isLooping && styles.pillBtnActive]}
              >
                <Text style={[styles.pillText, !isLooping && styles.pillTextActive]}>
                  Loop: OFF 🛑
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsLooping(true)}
                style={[styles.pillBtn, isLooping && styles.pillBtnActive]}
              >
                <Text style={[styles.pillText, isLooping && styles.pillTextActive]}>
                  Loop: ON 🔁
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.featureRow}>
            <FeatureChip icon="🖼" label="Poster Cross-Fade" />
            <FeatureChip icon="🔋" label="Focus-Aware Pause" />
            <FeatureChip icon="📱" label="TextureView (Android)" />
            <FeatureChip icon="♻️" label="Auto-Release Memory" />
            <FeatureChip icon="🏊" label="Video Player Pool" />
            <FeatureChip icon="👆" label="Touch Passthrough" />
          </View>
        </Animated.View>

        {/* ── Bottom ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.switchBtn}
            onPress={onSwitchMode}
          >
            <Text style={styles.switchBtnText}>Switch to Galaxy (Skia) →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </VideoBackground>
  );
}

// ─── Galaxy Background Demo ────────────────────────────────────────────────

function GalaxyDemo({ onSwitchMode }: { onSwitchMode: () => void }) {
  const [currentTheme, setCurrentTheme] = useState<GalaxyTheme>('blue');
  const [currentDirection, setCurrentDirection] = useState<GalaxyDirection>('zoom-in');
  const [currentZoom, setCurrentZoom] = useState<GalaxyZoom>('none');

  const themes: { id: GalaxyTheme; name: string }[] = [
    { id: 'blue', name: 'Blue Galaxy 🌌' },
    { id: 'sunset', name: 'Sunset Orange 🌅' },
    { id: 'dark', name: 'Midnight Dark 🌑' },
  ];

  const directions: { id: GalaxyDirection; name: string }[] = [
    { id: 'zoom-in', name: 'Warp Zoom In 🚀' },
    { id: 'zoom-out', name: 'Warp Zoom Out 🌌' },
    { id: '360', name: '360° Orbit 🌀' },
    { id: 'bottom', name: 'Upward' },
    { id: 'top', name: 'Downward' },
    { id: 'random', name: 'Random' },
  ];

  const zoomModes: { id: GalaxyZoom; name: string }[] = [
    { id: 'none', name: 'Standard' },
    { id: 'in', name: 'Zoom In 🔍' },
    { id: 'out', name: 'Zoom Out 🔭' },
    { id: 'breathe', name: 'Breathe / Pulse 🌊' },
  ];

  return (
    <GalaxyBackgroundView
      theme={currentTheme}
      direction={currentDirection}
      zoom={currentZoom}
      numStars={300}
      numDust={150}
      speedMultiplier={1.0}
      style={styles.container}
    >
      <View style={styles.screen}>
        {/* ── Top Header ── */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.topHeader}>
          <Text style={styles.libraryTag}>SKIA GPU CANVAS</Text>
          <Text style={styles.libraryTitle}>Galaxy Background</Text>
        </Animated.View>

        {/* ── Center Card ── */}
        <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.heroCard}>
          <Text style={styles.heroBadge}>60 - 120 FPS GPU Accelerated</Text>
          <Text style={styles.heroTitle}>Particle Canvas</Text>
          <Text style={styles.heroSubtitle}>
            React Native Skia & C++ Reanimated Worklets for native 60–120 FPS
            particle rendering with 3D Warp Zoom animations.
          </Text>

          {/* Theme Pills */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Theme</Text>
            <View style={styles.pillRow}>
              {themes.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  activeOpacity={0.8}
                  onPress={() => setCurrentTheme(t.id)}
                  style={[styles.pillBtn, currentTheme === t.id && styles.pillBtnActive]}
                >
                  <Text style={[styles.pillText, currentTheme === t.id && styles.pillTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Direction / Warp Zoom Pills */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Motion & Warp Zoom</Text>
            <View style={styles.pillRow}>
              {directions.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.8}
                  onPress={() => setCurrentDirection(d.id)}
                  style={[styles.pillBtn, currentDirection === d.id && styles.pillBtnActive]}
                >
                  <Text style={[styles.pillText, currentDirection === d.id && styles.pillTextActive]}>
                    {d.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Camera Zoom Depth Pills */}
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Camera Zoom Depth</Text>
            <View style={styles.pillRow}>
              {zoomModes.map((z) => (
                <TouchableOpacity
                  key={z.id}
                  activeOpacity={0.8}
                  onPress={() => setCurrentZoom(z.id)}
                  style={[styles.pillBtn, currentZoom === z.id && styles.pillBtnActive]}
                >
                  <Text style={[styles.pillText, currentZoom === z.id && styles.pillTextActive]}>
                    {z.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── Bottom ── */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.bottomSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.switchBtn}
            onPress={onSwitchMode}
          >
            <Text style={styles.switchBtnText}>Switch to Video (expo-video) →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </GalaxyBackgroundView>
  );
}

// ─── Feature Chip ──────────────────────────────────────────────────────────

function FeatureChip({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureChip}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },

  // ── Header ──
  topHeader: { alignItems: 'center', marginTop: 8 },
  libraryTag: {
    color: '#6ee2d5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  libraryTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Status Badge ──
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(110, 226, 213, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(110, 226, 213, 0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6ee2d5',
    marginRight: 6,
  },
  statusText: {
    color: '#6ee2d5',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  heroBadge: {
    color: '#a6f5ea',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },

  // ── Feature Chips ──
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  featureIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  featureLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Controls ──
  controlGroup: { width: '100%', marginBottom: 14 },
  controlLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pillBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  pillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#081735',
  },

  // ── Bottom ──
  bottomSection: { width: '100%', marginBottom: 8 },
  switchBtn: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  switchBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
