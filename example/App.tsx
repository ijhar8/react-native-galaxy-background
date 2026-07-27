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
const LEFT_BAR_HEIGHT = 215;  // Taller left bar
const RIGHT_BAR_HEIGHT = 150; // Shorter right bar

// ─── 3D Volumetric Porcelain Clay Capsule Pill Component ───
const VolumetricCapsule = ({ height }: { height: number }) => {
  return (
    <View style={[styles.capsule3DContainer, { height }]}>
      {/* 3D Clay Porcelain Base Body */}
      <View style={styles.capsuleBase3D}>
        {/* Right Edge Cylindrical Curve Shadow */}
        <View style={styles.capsuleCylinderShade} />
        {/* Left Specular Light Reflection Stripe */}
        <View style={styles.capsuleSpecularLight} />
        {/* Top Dome Sphere Highlight */}
        <View style={styles.capsuleTopDome} />
        {/* Bottom Dome Occlusion Shadow */}
        <View style={styles.capsuleBottomDome} />
      </View>
    </View>
  );
};

export default function App() {
  // Intro progress: 0 (zoomed in close, 3D angled) → 1 (zoomed out, resting position)
  const introProgress = useSharedValue(0);
  const floatY = useSharedValue(0);

  const playIntroAnimation = () => {
    introProgress.value = 0;
    // 4-second 360° 3D spin & zoom out intro
    introProgress.value = withTiming(1, {
      duration: 4000,
      easing: Easing.out(Easing.cubic),
    });
  };

  useEffect(() => {
    playIntroAnimation();

    // Subtle 3D ambient float motion after intro completes
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

  // ─── 4-Second 3D Orbit Spin & Zoom Out ───
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(introProgress.value, [0, 1], [3.4, 1.0]);
    const rotateY = interpolate(introProgress.value, [0, 1], [0, 360]);
    const rotateX = interpolate(introProgress.value, [0, 0.5, 1], [-15, 10, 0]);
    const translateY = interpolate(introProgress.value, [0, 1], [35, 0]);

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

  // Left bar tilt angle
  const leftBarStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(introProgress.value, [0, 1], [12, 22]);
    return {
      transform: [{ rotateZ: `${rotateZ}deg` }],
    };
  });

  // Right bar tilt angle
  const rightBarStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(introProgress.value, [0, 1], [-12, -22]);
    return {
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

          {/* ── Center: 3D Volumetric Capsule Logo (Tap to Replay) ── */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={playIntroAnimation} 
            style={styles.logoSection}
          >
            <Animated.View style={[styles.capsulePair, containerAnimatedStyle]}>
              {/* Left Bar (Taller 3D Capsule) */}
              <Animated.View style={[styles.capsuleWrapper, styles.leftBar, leftBarStyle]}>
                <VolumetricCapsule height={LEFT_BAR_HEIGHT} />
              </Animated.View>

              {/* Right Bar (Shorter 3D Capsule) */}
              <Animated.View style={[styles.capsuleWrapper, styles.rightBar, rightBarStyle]}>
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
  },

  leftBar: {
    left: 45,
    bottom: 0,
  },
  rightBar: {
    right: 45,
    bottom: 0,
  },

  // ─── 3D Volumetric Claymorphic Capsule Pill Styles ───
  capsule3DContainer: {
    width: BAR_WIDTH,
    borderRadius: BAR_WIDTH / 2,
    shadowColor: '#020914',
    shadowOffset: { width: 8, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 24,
  },

  capsuleBase3D: {
    flex: 1,
    borderRadius: BAR_WIDTH / 2,
    backgroundColor: '#edf2f7',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },

  // 3D Cylindrical Curve Shadow (Shaded Right Side)
  capsuleCylinderShade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: BAR_WIDTH * 0.45,
    backgroundColor: 'rgba(150, 172, 195, 0.55)',
  },

  // Left Edge Specular Reflection Stripe
  capsuleSpecularLight: {
    position: 'absolute',
    left: 3,
    top: 6,
    bottom: 6,
    width: 11,
    borderRadius: 5.5,
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 5,
  },

  // Top Dome Cap 3D Sphere Highlight
  capsuleTopDome: {
    position: 'absolute',
    top: 2,
    left: 3,
    right: 3,
    height: BAR_WIDTH - 4,
    borderRadius: (BAR_WIDTH - 4) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },

  // Bottom Cap Ambient Occlusion Shadow
  capsuleBottomDome: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BAR_WIDTH * 0.7,
    backgroundColor: 'rgba(120, 142, 168, 0.35)',
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
