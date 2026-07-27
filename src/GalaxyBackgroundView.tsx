import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Circle, Rect, LinearGradient, Blur, Path, Skia, vec } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, useDerivedValue, SharedValue } from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

const SCREEN = Dimensions.get('window');

export type GalaxyDirection = 'still' | 'bottom' | 'top' | 'left' | 'right' | '360' | 'random';

export interface GalaxyBackgroundProps extends ViewProps {
  /** Number of small star particles. @default 200 */
  numStars?: number;
  /** Number of soft cosmic dust particles. @default 100 */
  numDust?: number;
  /** Particle movement direction: 'still' | 'bottom' | 'top' | 'left' | 'right' | '360' | 'random'. @default '360' */
  direction?: GalaxyDirection;
  /** Speed multiplier for particle movement. @default 1.0 */
  speedMultiplier?: number;
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
  driftSpeed: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  randomAngle: number;
};

type DustConfig = {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  driftSpeed: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  randomAngle: number;
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

// ─── Native UI Thread Particle Worklet Motion Helper ───
function useParticlePosition(
  config: {
    x: number;
    y: number;
    driftSpeed: number;
    orbitAngle: number;
    orbitSpeed: number;
    orbitRadius: number;
    randomAngle: number;
  },
  time: SharedValue<number>,
  center: { x: number; y: number },
  w: number,
  h: number,
  direction: GalaxyDirection,
  speedMultiplier: number
) {
  return useDerivedValue(() => {
    'worklet';
    const t = time.value * config.driftSpeed * speedMultiplier;
    let x = config.x;
    let y = config.y;

    if (direction === 'still') {
      x = config.x;
      y = config.y;
    } else if (direction === 'bottom') {
      y = config.y - t * 15;
      y = ((y % (h + 30)) + (h + 30)) % (h + 30) - 15;
    } else if (direction === 'top') {
      y = config.y + t * 15;
      y = ((y % (h + 30)) + (h + 30)) % (h + 30) - 15;
    } else if (direction === 'left') {
      x = config.x - t * 15;
      x = ((x % (w + 30)) + (w + 30)) % (w + 30) - 15;
    } else if (direction === 'right') {
      x = config.x + t * 15;
      x = ((x % (w + 30)) + (w + 30)) % (w + 30) - 15;
    } else if (direction === '360') {
      const currentAngle = config.orbitAngle + time.value * config.orbitSpeed * speedMultiplier;
      x = center.x + Math.cos(currentAngle) * config.orbitRadius;
      y = center.y + Math.sin(currentAngle) * config.orbitRadius;
    } else if (direction === 'random') {
      x = config.x + Math.cos(config.randomAngle) * t * 12;
      y = config.y + Math.sin(config.randomAngle) * t * 12;
      x = ((x % (w + 30)) + (w + 30)) % (w + 30) - 15;
      y = ((y % (h + 30)) + (h + 30)) % (h + 30) - 15;
    }

    return { x, y };
  });
}

// ─── Native UI Thread Star Particle Component ───
const GalaxyStar = React.memo(({
  star,
  time,
  center,
  w,
  h,
  direction,
  speedMultiplier,
}: {
  star: StarConfig;
  time: SharedValue<number>;
  center: { x: number; y: number };
  w: number;
  h: number;
  direction: GalaxyDirection;
  speedMultiplier: number;
}) => {
  const pos = useParticlePosition(star, time, center, w, h, direction, speedMultiplier);

  const cx = useDerivedValue(() => {
    'worklet';
    return pos.value.x;
  });

  const cy = useDerivedValue(() => {
    'worklet';
    return pos.value.y;
  });

  const opacity = useDerivedValue(() => {
    'worklet';
    const v = (Math.sin(time.value * star.speed + star.phase) + 1) / 2;
    return 0.45 + v * 0.45;
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

// ─── Native UI Thread Cosmic Dust Particle Component ───
const CosmicDust = React.memo(({
  dust,
  time,
  center,
  w,
  h,
  direction,
  speedMultiplier,
}: {
  dust: DustConfig;
  time: SharedValue<number>;
  center: { x: number; y: number };
  w: number;
  h: number;
  direction: GalaxyDirection;
  speedMultiplier: number;
}) => {
  const pos = useParticlePosition(dust, time, center, w, h, direction, speedMultiplier);

  const cx = useDerivedValue(() => {
    'worklet';
    return pos.value.x;
  });

  const cy = useDerivedValue(() => {
    'worklet';
    return pos.value.y;
  });

  const opacity = useDerivedValue(() => {
    'worklet';
    const v = (Math.sin(time.value * dust.speed + dust.phase) + 1) / 2;
    return 0.15 + v * 0.35;
  });

  return <Circle cx={cx} cy={cy} r={dust.r} color="#a6f5ea" opacity={opacity} />;
});

export default function GalaxyBackgroundView({
  numStars = 200,
  numDust = 100,
  direction = '360',
  speedMultiplier = 1.0,
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

  // Precalculate Stars
  const stars = useMemo(() => {
    const maxRadius = Math.sqrt(w * w + h * h) * 0.65;
    return Array.from({ length: numStars }).map((): StarConfig => {
      const distRatio = Math.pow(Math.random(), 0.5);
      const orbitRadius = distRatio * maxRadius;
      const orbitAngle = Math.random() * Math.PI * 2;
      const isSparkle = Math.random() < 0.15;

      const x = center.x + Math.cos(orbitAngle) * orbitRadius;
      const y = center.y + Math.sin(orbitAngle) * orbitRadius;

      return {
        x,
        y,
        r: isSparkle ? 1.0 : Math.random() * 0.4 + 0.4,
        isSparkle,
        sparkleSize: Math.random() * 2.5 + 2.0,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.3,
        driftSpeed: Math.random() * 0.5 + 0.15,
        orbitRadius,
        orbitAngle,
        orbitSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
        randomAngle: Math.random() * Math.PI * 2,
      };
    });
  }, [numStars, w, h, center]);

  // Precalculate Dust Particles
  const dustParticles = useMemo(() => {
    const maxRadius = Math.sqrt(w * w + h * h) * 0.7;
    return Array.from({ length: numDust }).map((): DustConfig => {
      const orbitRadius = Math.random() * maxRadius;
      const orbitAngle = Math.random() * Math.PI * 2;
      const x = center.x + Math.cos(orbitAngle) * orbitRadius;
      const y = center.y + Math.sin(orbitAngle) * orbitRadius;

      return {
        x,
        y,
        r: Math.random() * 0.8 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.6 + 0.2,
        driftSpeed: Math.random() * 0.4 + 0.1,
        orbitRadius,
        orbitAngle,
        orbitSpeed: (Math.random() * 0.015 + 0.004) * (Math.random() < 0.5 ? 1 : -1),
        randomAngle: Math.random() * Math.PI * 2,
      };
    });
  }, [numDust, w, h, center]);

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

        {/* Dynamic Cosmic Dust Particles */}
        {dustParticles.map((dust, i) => (
          <CosmicDust
            key={`d-${i}`}
            dust={dust}
            time={time}
            center={center}
            w={w}
            h={h}
            direction={direction}
            speedMultiplier={speedMultiplier}
          />
        ))}

        {/* Dynamic Star Particles */}
        {stars.map((star, i) => (
          <GalaxyStar
            key={`s-${i}`}
            star={star}
            time={time}
            center={center}
            w={w}
            h={h}
            direction={direction}
            speedMultiplier={speedMultiplier}
          />
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
