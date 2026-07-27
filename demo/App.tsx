import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import GalaxyBackgroundView from './GalaxyBackgroundView';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  FadeInUp,
  FadeIn,
  interpolate,
} from 'react-native-reanimated';

// ─── Constants ───
const BAR_WIDTH = 42; // Thicker 3D volumetric capsule pillar
const LEFT_BAR_HEIGHT = 220;  // Taller left bar
const RIGHT_BAR_HEIGHT = 155; // Shorter right bar
const BAR_RADIUS = BAR_WIDTH / 2;

// ─── 3D Matte Porcelain Clay Capsule Component ───
const VolumetricCapsule = ({ height }: { height: number }) => {
  return (
    <View style={[styles.capsule3DContainer, { height }]}>
      {/* 3D Directional Cylindrical Shading Body */}
      <View style={styles.capsuleBase3D}>
        {/* Soft Left Light Highlight */}
        <View style={styles.capsuleLeftHighlight} />
        {/* Soft Right 3D Cylinder Curve Shadow */}
        <View style={styles.capsuleRightShadow} />
        {/* Top Dome Cap Soft Glow */}
        <View style={styles.capsuleTopCapGlow} />
      </View>
    </View>
  );
};

export default function App() {
  // 3D Intro progress: 0 (zoomed in, 3D rotated, parallel) → 1 (zoomed out, resting position)
  const introProgress = useSharedValue(0);
  const floatY = useSharedValue(0);

  const playIntroAnimation = () => {
    introProgress.value = 0;
    // 4-second cinematic 3D movie intro: Zoom + 3D Y-Axis Orbit + Spread
    introProgress.value = withTiming(1, {
      duration: 4000,
      easing: Easing.out(Easing.cubic),
    });
  };

  useEffect(() => {
    playIntroAnimation();

    // Ambient floating motion after intro completes
    floatY.value = withDelay(
      4200,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
          withTiming(8, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  // ─── Cinematic 3D Zoom & Orbit Rotation (Frame-by-Frame Reference Match) ───
  const containerAnimatedStyle = useAnimatedStyle(() => {
    // 1. Scale: Zooms out from 3.8x (Frame 1 close-up) down to 1.0x (Frame 4 final)
    const scale = interpolate(introProgress.value, [0, 0.4, 1], [3.8, 2.0, 1.0]);
    // 2. 3D Y-Axis Orbit Rotation: -65deg → -25deg → 0deg
    const rotateY = interpolate(introProgress.value, [0, 0.5, 1], [-65, -25, 0]);
    // 3. 3D X-Axis Tilt: 20deg → 0deg
    const rotateX = interpolate(introProgress.value, [0, 1], [20, 0]);
    const translateY = interpolate(introProgress.value, [0, 1], [40, 0]);

    return {
      transform: [
        { translateY: floatY.value + translateY },
        { perspective: 1200 },
        { scale },
        { rotateY: `${rotateY}deg` },
        { rotateX: `${rotateX}deg` },
      ],
    };
  });

  // ─── Left Bar: Starts nearly vertical (-5°), opens out to +22° ───
  const leftBarStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(introProgress.value, [0, 1], [-5, 22]);
    const leftOffset = interpolate(introProgress.value, [0, 1], [15, 45]);
    return {
      left: leftOffset,
      transform: [{ rotateZ: `${rotateZ}deg` }],
    };
  });

  // ─── Right Bar: Starts nearly vertical (+5°), opens out to -22° ───
  const rightBarStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(introProgress.value, [0, 1], [5, -22]);
    const rightOffset = interpolate(introProgress.value, [0, 1], [15, 45]);
    return {
      right: rightOffset,
      transform: [{ rotateZ: `${rotateZ}deg` }],
    };
  });

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <GalaxyBackgroundView theme="blue" numStars={200} style={styles.container}>
        <View style={styles.screen}>

          {/* ── Top Brand Title ── */}
          <Animated.View entering={FadeIn.delay(3500).duration(1000)} style={styles.topHeader}>
            <Text style={styles.brandTitle}>A M I N A</Text>
          </Animated.View>

          {/* ── Center: 3D Volumetric Capsule Logo (Tap to Replay Intro) ── */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={playIntroAnimation} 
            style={styles.logoSection}
          >
            <Animated.View style={[styles.capsulePair, containerAnimatedStyle]}>
              {/* Left Bar (Taller 3D Capsule) */}
              <Animated.View style={[styles.capsuleWrapper, leftBarStyle]}>
                <VolumetricCapsule height={LEFT_BAR_HEIGHT} />
              </Animated.View>

              {/* Right Bar (Shorter 3D Capsule) */}
              <Animated.View style={[styles.capsuleWrapper, rightBarStyle]}>
                <VolumetricCapsule height={RIGHT_BAR_HEIGHT} />
              </Animated.View>
            </Animated.View>

            {/* Tagline */}
            <Animated.Text
              entering={FadeInUp.delay(3800).duration(900)}
              style={styles.tagline}
            >
              Crypto.Simplified.
            </Animated.Text>
          </TouchableOpacity>

          {/* ── Bottom Action Buttons ── */}
          <View style={styles.bottomSection}>
            <Animated.View entering={FadeInUp.delay(4100).duration(800)}>
              <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Create an account</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(4300).duration(800)}>
              <TouchableOpacity activeOpacity={0.85} style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Log in</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

        </View>
      </GalaxyBackgroundView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },

  topHeader: { alignItems: 'center', marginTop: 8 },
  brandTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
    letterSpacing: 10,
    opacity: 0.92,
  },

  logoSection: { alignItems: 'center', justifyContent: 'center', flex: 1 },

  capsulePair: {
    width: 250,
    height: LEFT_BAR_HEIGHT + 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },

  capsuleWrapper: {
    position: 'absolute',
    bottom: 0,
  },

  // ─── 3D Matte Claymorphic Volumetric Cylinder Shading ───
  capsule3DContainer: {
    width: BAR_WIDTH,
    borderRadius: BAR_RADIUS,
    shadowColor: '#020914',
    shadowOffset: { width: 6, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 22,
  },

  capsuleBase3D: {
    flex: 1,
    borderRadius: BAR_RADIUS,
    backgroundColor: '#f2f6fa',
    overflow: 'hidden',
  },

  // Soft Directional 3D Cylinder Shadow Curve (Right Edge)
  capsuleRightShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: BAR_WIDTH * 0.42,
    backgroundColor: 'rgba(155, 175, 198, 0.45)',
  },

  // Left Side Specular Light Soft Glow
  capsuleLeftHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: BAR_WIDTH * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },

  // Top Cap Rounded Dome Highlight
  capsuleTopCapGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BAR_WIDTH,
    borderRadius: BAR_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },

  tagline: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 0.4,
    opacity: 0.9,
  },

  bottomSection: { width: '100%', gap: 14, marginBottom: 10 },

  primaryBtn: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#0a2a52', fontSize: 17, fontWeight: '600' },

  secondaryBtn: {
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  secondaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
