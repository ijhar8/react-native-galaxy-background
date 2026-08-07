import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeOut,
  FadeOutDown,
} from 'react-native-reanimated';

// ── Galaxy Background (Skia particles) ──
import GalaxyBackgroundView, {
  GalaxyDirection,
  GalaxyZoom,
  GalaxyTheme,
} from './GalaxyBackgroundView';

// ── Video Background (expo-video) ──
import { VideoBackground } from './VideoBackground';

// ─── Types ─────────────────────────────────────────────────────────────────

type DemoMode = 'galaxy' | 'video';

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState<DemoMode>('galaxy');
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  // Galaxy Controls
  const [currentTheme, setCurrentTheme] = useState<GalaxyTheme>('blue');
  const [currentDirection, setCurrentDirection] = useState<GalaxyDirection>('zoom-in');
  const [currentZoom, setCurrentZoom] = useState<GalaxyZoom>('none');
  const [numStars, setNumStars] = useState(300);
  const [numDust, setNumDust] = useState(150);

  // Video Controls
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const handleVideoReady = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const themes: { id: GalaxyTheme; name: string }[] = [
    { id: 'blue', name: 'Blue Galaxy 🌌' },
    { id: 'sunset', name: 'Sunset Orange 🌅' },
    { id: 'dark', name: 'Midnight Dark 🌑' },
  ];

  const directions: { id: GalaxyDirection; name: string }[] = [
    { id: 'zoom-in', name: 'Warp Zoom In 🚀' },
    { id: 'zoom-out', name: 'Warp Zoom Out 🌌' },
    { id: '360', name: '360° Orbit 🌀' },
    { id: 'bottom', name: 'Upward ⬆️' },
    { id: 'top', name: 'Downward ⬇️' },
    { id: 'random', name: 'Random 🔀' },
  ];

  const zoomModes: { id: GalaxyZoom; name: string }[] = [
    { id: 'none', name: 'Off' },
    { id: 'in', name: 'Zoom In 🔍' },
    { id: 'out', name: 'Zoom Out 🔭' },
    { id: 'breathe', name: 'Breathe / Pulse 🌊' },
  ];

  const densityPresets = [
    { label: 'Light', stars: 100, dust: 50 },
    { label: 'Medium', stars: 300, dust: 150 },
    { label: 'Dense', stars: 800, dust: 400 },
    { label: 'Ultra GPU ⚡', stars: 3000, dust: 1500 },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Background Renderer (Galaxy Skia vs Video) ── */}
      {mode === 'galaxy' ? (
        <GalaxyBackgroundView
          theme={currentTheme}
          direction={currentDirection}
          zoom={currentZoom}
          numStars={numStars}
          numDust={numDust}
          speedMultiplier={1.0}
          style={styles.container}
        >
          <View style={styles.screen}>
            {/* ── Floating Header & Toggle Button ── */}
            <HeaderSection
              mode={mode}
              isConfigOpen={isConfigOpen}
              onToggleConfig={() => setIsConfigOpen(!isConfigOpen)}
            />

            {/* ── Collapsible Config Card ── */}
            {isConfigOpen && (
              <Animated.View
                entering={FadeInUp.duration(400)}
                exiting={FadeOutDown.duration(300)}
                style={styles.configModal}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalBadge}>INTERACTIVE CONTROLS</Text>
                    <Text style={styles.modalTitle}>Galaxy Settings</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.closeBtn}
                    onPress={() => setIsConfigOpen(false)}
                  >
                    <Text style={styles.closeBtnText}>✕ Close</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.scrollArea}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Background Mode Switch */}
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Background Engine</Text>
                    <View style={styles.pillRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setMode('galaxy')}
                        style={[styles.pillBtn, mode === 'galaxy' && styles.pillBtnActive]}
                      >
                        <Text style={[styles.pillText, mode === 'galaxy' && styles.pillTextActive]}>
                          Galaxy Canvas (Skia) 🌌
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setMode('video')}
                        style={[styles.pillBtn, mode === 'video' && styles.pillBtnActive]}
                      >
                        <Text style={[styles.pillText, mode === 'video' && styles.pillTextActive]}>
                          Video (expo-video) 🎬
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Theme Selector */}
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Color Theme</Text>
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

                  {/* Motion & Warp Zoom */}
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Motion & 3D Warp Zoom</Text>
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

                  {/* Camera Zoom Depth */}
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

                  {/* Particle Density Presets */}
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>
                      Particle Density ({numStars} stars • {numDust} dust)
                    </Text>
                    <View style={styles.pillRow}>
                      {densityPresets.map((p) => {
                        const isSelected = numStars === p.stars && numDust === p.dust;
                        return (
                          <TouchableOpacity
                            key={p.label}
                            activeOpacity={0.8}
                            onPress={() => {
                              setNumStars(p.stars);
                              setNumDust(p.dust);
                            }}
                            style={[styles.pillBtn, isSelected && styles.pillBtnActive]}
                          >
                            <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                              {p.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>
            )}

            {/* ── Bottom Floating Bar when Config Closed ── */}
            {!isConfigOpen && (
              <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(200)} style={styles.bottomBar}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.openConfigBtn}
                  onPress={() => setIsConfigOpen(true)}
                >
                  <Text style={styles.openConfigText}>⚙️ Open Config & Controls</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </GalaxyBackgroundView>
      ) : (
        <VideoBackground
          source={require('./assets/deep_space.mp4')}
          posterSource={require('./assets/deep_space_poster.jpg')}
          isLooping={isLooping}
          isMuted={true}
          contentFit="cover"
          fadeDuration={800}
          onReadyToPlay={handleVideoReady}
          style={styles.container}
        >
          <View style={styles.screen}>
            {/* ── Floating Header & Toggle Button ── */}
            <HeaderSection
              mode={mode}
              isConfigOpen={isConfigOpen}
              onToggleConfig={() => setIsConfigOpen(!isConfigOpen)}
              isVideoReady={isVideoReady}
            />

            {/* ── Collapsible Config Card ── */}
            {isConfigOpen && (
              <Animated.View
                entering={FadeInUp.duration(400)}
                exiting={FadeOutDown.duration(300)}
                style={styles.configModal}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalBadge}>HARDWARE GPU DECODED</Text>
                    <Text style={styles.modalTitle}>Video Settings</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.closeBtn}
                    onPress={() => setIsConfigOpen(false)}
                  >
                    <Text style={styles.closeBtnText}>✕ Close</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.scrollArea}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Background Mode Switch */}
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Background Engine</Text>
                    <View style={styles.pillRow}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setMode('galaxy')}
                        style={[styles.pillBtn, mode === 'galaxy' && styles.pillBtnActive]}
                      >
                        <Text style={[styles.pillText, mode === 'galaxy' && styles.pillTextActive]}>
                          Galaxy Canvas (Skia) 🌌
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setMode('video')}
                        style={[styles.pillBtn, mode === 'video' && styles.pillBtnActive]}
                      >
                        <Text style={[styles.pillText, mode === 'video' && styles.pillTextActive]}>
                          Video (expo-video) 🎬
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Loop Control */}
                  <View style={styles.controlGroup}>
                    <Text style={styles.controlLabel}>Loop Mode</Text>
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

                  {/* Feature Chips */}
                  <View style={styles.featureRow}>
                    <FeatureChip icon="🖼" label="Poster Cross-Fade" />
                    <FeatureChip icon="🔋" label="Focus-Aware Pause" />
                    <FeatureChip icon="📱" label="TextureView (Android)" />
                    <FeatureChip icon="♻️" label="Auto-Release Memory" />
                    <FeatureChip icon="🏊" label="Video Player Pool" />
                    <FeatureChip icon="👆" label="Touch Passthrough" />
                  </View>
                </ScrollView>
              </Animated.View>
            )}

            {/* ── Bottom Floating Bar when Config Closed ── */}
            {!isConfigOpen && (
              <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut.duration(200)} style={styles.bottomBar}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.openConfigBtn}
                  onPress={() => setIsConfigOpen(true)}
                >
                  <Text style={styles.openConfigText}>⚙️ Open Config & Controls</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </VideoBackground>
      )}
    </>
  );
}

// ─── Header Section Component ──────────────────────────────────────────────

function HeaderSection({
  mode,
  isConfigOpen,
  onToggleConfig,
  isVideoReady,
}: {
  mode: DemoMode;
  isConfigOpen: boolean;
  onToggleConfig: () => void;
  isVideoReady?: boolean;
}) {
  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.topHeader}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.libraryTag}>
            {mode === 'galaxy' ? 'SKIA GPU CANVAS' : 'EXPO-VIDEO POWERED'}
          </Text>
          <Text style={styles.libraryTitle}>
            {mode === 'galaxy' ? 'Galaxy Background' : 'Video Background'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toggleConfigBtn, isConfigOpen && styles.toggleConfigBtnActive]}
          onPress={onToggleConfig}
        >
          <Text style={styles.toggleConfigBtnText}>
            {isConfigOpen ? '✕ Hide' : '⚙️ Config'}
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'video' && isVideoReady && (
        <Animated.View entering={FadeIn.delay(200).duration(400)}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>GPU Playback Active</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Feature Chip Component ────────────────────────────────────────────────

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
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },

  // ── Top Header ──
  topHeader: {
    width: '100%',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryTag: {
    color: '#6ee2d5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  libraryTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toggleConfigBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  toggleConfigBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  toggleConfigBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Status Badge ──
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(110, 226, 213, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
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

  // ── Config Modal Sheet ──
  configModal: {
    flex: 1,
    maxHeight: '82%',
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalBadge: {
    color: '#a6f5ea',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Scroll Content ──
  scrollArea: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // ── Controls ──
  controlGroup: { width: '100%', marginBottom: 14 },
  controlLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 7,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  pillBtnActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  pillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#081735',
  },

  // ── Feature Chips ──
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 6,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  featureIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  featureLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Bottom Floating Bar when Closed ──
  bottomBar: {
    width: '100%',
    alignItems: 'center',
  },
  openConfigBtn: {
    height: 50,
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  openConfigText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
