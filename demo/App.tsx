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
const BAR_WIDTH = 42;
const LEFT_BAR_HEIGHT = 215;
const RIGHT_BAR_HEIGHT = 150;
const BAR_RADIUS = BAR_WIDTH / 2;

// ─── 3D Volumetric Porcelain Clay Capsule Component ───
const VolumetricCapsule = ({ height }: { height: number }) => {
  return (
    <View style={[styles.capsule3DContainer, { height }]}>
      <View style={styles.capsuleBase3D}>
        <View style={styles.capsuleLeftHighlight} />
        <View style={styles.capsuleRightShadow} />
        <View style={styles.capsuleTopCapGlow} />
      </View>
    </View>
  );
};

export default function App() {
  const introProgress = useSharedValue(0);
  const floatY = useSharedValue(0);

  const playIntroAnimation = () => {
    introProgress.value = 0;
    introProgress.value = withTiming(1, {
      duration: 4000,
      easing: Easing.out(Easing.cubic),
    });
  };

  useEffect(() => {
    playIntroAnimation();

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

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(introProgress.value, [0, 0.4, 1], [3.8, 2.0, 1.0]);
    const rotateY = interpolate(introProgress.value, [0, 0.5, 1], [-65, -25, 0]);
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

  const leftBarStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(introProgress.value, [0, 1], [-5, 22]);
    const leftOffset = interpolate(introProgress.value, [0, 1], [15, 45]);
    return {
      left: leftOffset,
      transform: [{ rotateZ: `${rotateZ}deg` }],
    };
  });

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
      {/* Testing with Sunset Orange Theme (theme="orange") */}
      <GalaxyBackgroundView
        theme="orange"
        numStars={300}
        numDust={150}
        direction="360"
        speedMultiplier={1.0}
        style={styles.container}
      >
        <View style={styles.screen}>

          <Animated.View entering={FadeIn.delay(3500).duration(1000)} style={styles.topHeader}>
            <Text style={styles.brandTitle}>A M I N A</Text>
          </Animated.View>

          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={playIntroAnimation} 
            style={styles.logoSection}
          >
            <Animated.View style={[styles.capsulePair, containerAnimatedStyle]}>
              <Animated.View style={[styles.capsuleWrapper, leftBarStyle]}>
                <VolumetricCapsule height={LEFT_BAR_HEIGHT} />
              </Animated.View>

              <Animated.View style={[styles.capsuleWrapper, rightBarStyle]}>
                <VolumetricCapsule height={RIGHT_BAR_HEIGHT} />
              </Animated.View>
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.delay(3800).duration(900)}
              style={styles.tagline}
            >
              Crypto.Simplified.
            </Animated.Text>
          </TouchableOpacity>

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

  capsuleRightShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: BAR_WIDTH * 0.42,
    backgroundColor: 'rgba(155, 175, 198, 0.45)',
  },

  capsuleLeftHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: BAR_WIDTH * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },

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
  primaryBtnText: { color: '#4a1020', fontSize: 17, fontWeight: '600' },

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
