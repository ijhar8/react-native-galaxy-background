import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Circle, Rect, LinearGradient, Blur, Path, Skia, vec } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, useDerivedValue, SharedValue } from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

const SCREEN = Dimensions.get('window');

export interface GalaxyBackgroundProps extends ViewProps {
  /** Number of small particles. @default 200 */
  numStars?: number;
  children?: React.ReactNode;
  theme?: 'blue' | 'dark';
}

type StarConfig = {
  x: number;
  y: number;
  r: number;
  isSparkle: boolean;
  sparkleSize: number;
  phase: number;
  speed: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
};

// ─── 4-Point Star Flare Skia Path Generator ───
function createSparklePath(cx: number, cy: number, size: number) {
  const path = Skia.Path.Make();
  const s = size;
  path.moveTo(cx, cy - s);
  path.quadTo(cx, cy, cx + s, cy);
  path.quadTo(cx, cy, cx, cy + s);
  path.quadTo(cx, cy, cx - s, cy);
  path.quadTo(cx, cy, cx, cy - s);
  path.close();
  return path;
}

// ─── Small Star Particle Node (Slow Orbiting, Subtle Glow, No Blinking) ───
const GalaxyStar = React.memo(({ star, time, center }: { star: StarConfig; time: SharedValue<number>; center: { x: number; y: number } }) => {
  // Slow 360° orbit around galaxy center
  const cx = useDerivedValue(() => {
    'worklet';
    const currentAngle = star.orbitAngle + time.value * star.orbitSpeed;
    return center.x + Math.cos(currentAngle) * star.orbitRadius;
  });

  const cy = useDerivedValue(() => {
    'worklet';
    const currentAngle = star.orbitAngle + time.value * star.orbitSpeed;
    return center.y + Math.sin(currentAngle) * star.orbitRadius;
  });

  // Subtle breathing opacity (no harsh blinking)
  const opacity = useDerivedValue(() => {
    'worklet';
    const v = (Math.sin(time.value * star.speed + star.phase) + 1) / 2;
    return 0.45 + v * 0.45; // Smooth 0.45 - 0.90 opacity range
  });

  const sparklePath = useMemo(() => {
    if (star.isSparkle) {
      return createSparklePath(star.x, star.y, star.sparkleSize);
    }
    return null;
  }, [star]);

  if (star.isSparkle && sparklePath) {
    return (
      <>
        <Circle cx={cx} cy={cy} r={star.sparkleSize * 1.1} color="rgba(255, 255, 255, 0.18)" opacity={opacity} />
        <Path path={sparklePath} color="#ffffff" opacity={opacity} />
        <Circle cx={cx} cy={cy} r={star.r} color="#ffffff" opacity={opacity} />
      </>
    );
  }

  return <Circle cx={cx} cy={cy} r={star.r} color="#ffffff" opacity={opacity} />;
});

export default function GalaxyBackgroundView({
  numStars = 200,
  children,
  style,
  theme = 'blue',
  ...props
}: GalaxyBackgroundProps) {
  const w = SCREEN.width;
  const h = SCREEN.height;
  const center = useMemo(() => ({ x: w / 2, y: h / 2 }), [w, h]);
  const time = useSharedValue(0);

  // Native UI thread frame loop - ZERO JS thread execution
  useFrameCallback((fi: any) => {
    if (fi.timeSinceFirstFrame) {
      time.value = fi.timeSinceFirstFrame / 1000;
    }
  });

  // Exactly 200 Small Particles
  const stars = useMemo(() => {
    const maxRadius = Math.sqrt(w * w + h * h) * 0.65;
    return Array.from({ length: numStars }).map((): StarConfig => {
      const distRatio = Math.pow(Math.random(), 0.5);
      const orbitRadius = distRatio * maxRadius;
      const orbitAngle = Math.random() * Math.PI * 2;
      const isSparkle = Math.random() < 0.15; // 15% subtle 4-point sparkles ⭐

      const x = center.x + Math.cos(orbitAngle) * orbitRadius;
      const y = center.y + Math.sin(orbitAngle) * orbitRadius;

      return {
        x,
        y,
        r: isSparkle ? 1.0 : Math.random() * 0.4 + 0.4, // Small particle radius (0.4 - 1.0px)
        isSparkle,
        sparkleSize: Math.random() * 2.5 + 2.0,       // Small sparkle size
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3,              // Very slow breathing speed
        orbitRadius,
        orbitAngle,
        orbitSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1), // Slow orbit
      };
    });
  }, [numStars, w, h, center]);

  const gradientColors =
    theme === 'blue'
      ? ['#6ee2d5', '#28B3A3', '#1b5f8c', '#0f315a', '#061733', '#030a1c']
      : ['#1a1a2e', '#16213e', '#0f3460', '#030712'];

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Skia GPU Canvas with explicit bounds */}
      <Canvas style={[StyleSheet.absoluteFill, { width: w, height: h }]}>
        {/* Deep Space Base Gradient */}
        <Rect x={0} y={0} width={w} height={h}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, h)}
            colors={gradientColors}
          />
        </Rect>

        {/* Soft Glowing Center Nebula Gas */}
        <Circle cx={center.x} cy={center.y + 40} r={w * 0.75} color="rgba(40, 179, 163, 0.22)">
          <Blur blur={50} />
        </Circle>

        {/* 200 Small Particles (Slow Orbiting, Steady Glow) */}
        {stars.map((star, i) => (
          <GalaxyStar key={`s-${i}`} star={star} time={time} center={center} />
        ))}
      </Canvas>

      {/* Foreground Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030a1c' },
  content: { flex: 1, zIndex: 1 },
});
