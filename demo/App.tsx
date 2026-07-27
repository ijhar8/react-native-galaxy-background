import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import GalaxyBackgroundView, { GalaxyDirection, GalaxyTheme } from './GalaxyBackgroundView';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<GalaxyTheme>('blue');
  const [currentDirection, setCurrentDirection] = useState<GalaxyDirection>('360');

  const themes: { id: GalaxyTheme; name: string }[] = [
    { id: 'blue', name: 'Blue Galaxy 🌌' },
    { id: 'sunset', name: 'Sunset Orange 🌅' },
    { id: 'dark', name: 'Midnight Dark 🌑' },
  ];

  const directions: { id: GalaxyDirection; name: string }[] = [
    { id: '360', name: '360° Orbit' },
    { id: 'bottom', name: 'Upward Flow' },
    { id: 'top', name: 'Downward Flow' },
    { id: 'random', name: 'Random Vector' },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <GalaxyBackgroundView
        theme={currentTheme}
        direction={currentDirection}
        numStars={300}
        numDust={150}
        speedMultiplier={1.0}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.screen}>

            {/* ── Top Library Header ── */}
            <Animated.View entering={FadeIn.duration(800)} style={styles.topHeader}>
              <Text style={styles.libraryTag}>REACT NATIVE</Text>
              <Text style={styles.libraryTitle}>Galaxy Background</Text>
            </Animated.View>

            {/* ── Center Feature Card ── */}
            <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.heroCard}>
              <Text style={styles.heroBadge}>60 - 120 FPS GPU Accelerated</Text>
              <Text style={styles.heroTitle}>Deep Space Canvas</Text>
              <Text style={styles.heroSubtitle}>
                Powered by React Native Skia & C++ Reanimated Worklets for native 60–120 FPS performance.
              </Text>

              {/* Theme Selector Pills */}
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

              {/* Direction Selector Pills */}
              <View style={styles.controlGroup}>
                <Text style={styles.controlLabel}>Motion Direction</Text>
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
            </Animated.View>

            {/* ── Bottom Action Buttons ── */}
            <View style={styles.bottomSection}>
              <Animated.View entering={FadeInUp.delay(500).duration(800)}>
                <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Get Started with NPM</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

          </View>
        </SafeAreaView>
      </GalaxyBackgroundView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  topHeader: { alignItems: 'center', marginTop: 12 },
  libraryTag: {
    color: '#6ee2d5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  libraryTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  heroBadge: {
    color: '#a6f5ea',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },

  controlGroup: { width: '100%', marginBottom: 16 },
  controlLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
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

  bottomSection: { width: '100%', marginBottom: 8 },
  primaryBtn: {
    height: 54,
    backgroundColor: '#ffffff',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: { color: '#081735', fontSize: 16, fontWeight: '700' },
});
