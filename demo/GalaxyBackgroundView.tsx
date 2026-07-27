import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas, Circle, Rect, LinearGradient, Blur, vec } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, useDerivedValue, SharedValue } from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

const SCREEN = Dimensions.get('window');

export interface GalaxyBackgroundProps extends ViewProps {
  /** Number of particles in distant layer. @default 450 */
  numStars?: number;
  children?: React.ReactNode;
  theme?: 'blue' | 'dark';
}

type StarConfig = {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  driftSpeed: number;
};

type BokehConfig = {
  x: number;
  y: number;
  r: number;
  driftSpeed: number;
  maxOpacity: number;
};

// ─── Micro Distant Star Node ───
const MicroStar = React.memo(({ star, time, h }: { star: StarConfig; time: SharedValue<number>; h: number }) => {
  const cy = useDerivedValue(() => {
    const drift = time.value * star.driftSpeed * 12;
    let y = star.y - drift;
    return ((y % (h + 20)) + (h + 20)) % (h + 20) - 10;
  });

  const opacity = useDerivedValue(() => {
    const v = (Math.sin(time.value * star.speed + star.phase) + 1) / 2;
    return 0.2 + v * 0.8;
  });

  return <Circle cx={star.x} cy={cy} r={star.r} color="#ffffff" opacity={opacity} />;
});

// ─── Foreground Glowing Bokeh Star Node ───
const BokehStar = React.memo(({ star, time, h }: { star: BokehConfig; time: SharedValue<number>; h: number }) => {
  const cy = useDerivedValue(() => {
    const drift = time.value * star.driftSpeed * 22;
    let y = star.y - drift;
    return ((y % (h + 40)) + (h + 40)) % (h + 40) - 20;
  });

  const opacity = useDerivedValue(() => {
    const v = (Math.sin(time.value * 1.2 + star.x) + 1) / 2;
    return 0.15 + v * star.maxOpacity;
  });

  return <Circle cx={star.x} cy={cy} r={star.r} color="#b3f5ec" opacity={opacity} />;
});

export default function GalaxyBackgroundView({
  numStars = 450,
  children,
  style,
  theme = 'blue',
  ...props
}: GalaxyBackgroundProps) {
  const w = SCREEN.width;
  const h = SCREEN.height;
  const time = useSharedValue(0);

  useFrameCallback((fi: any) => {
    if (fi.timeSinceFirstFrame) {
      time.value = fi.timeSinceFirstFrame / 1000;
    }
  });

  // Layer 1: 450 Distant Micro Stars
  const microStars = useMemo(() => {
    return Array.from({ length: numStars }).map((): StarConfig => {
      const yBias = Math.pow(Math.random(), 0.5);
      return {
        x: Math.random() * w,
        y: yBias * h,
        r: Math.random() < 0.9 ? Math.random() * 0.6 + 0.4 : Math.random() * 1.1 + 1.0,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 2.2 + 0.6,
        driftSpeed: Math.random() * 0.5 + 0.15,
      };
    });
  }, [numStars, w, h]);

  // Layer 2: 70 Floating Foreground Bokeh Dust Particles
  const bokehStars = useMemo(() => {
    return Array.from({ length: 70 }).map((): BokehConfig => {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3.5 + 1.5,
        driftSpeed: Math.random() * 0.8 + 0.3,
        maxOpacity: Math.random() * 0.5 + 0.35,
      };
    });
  }, [w, h]);

  // Deep Space Cosmic Galaxy Gradient (Skia GPU rendered)
  const gradientColors =
    theme === 'blue'
      ? ['#68ebd9', '#28B3A3', '#1b5f8c', '#0f315a', '#061733', '#030a1c']
      : ['#1a1a2e', '#16213e', '#0f3460', '#030712'];

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Skia GPU Canvas with explicit dimensions */}
      <Canvas style={[StyleSheet.absoluteFill, { width: w, height: h }]}>
        {/* 1. Skia GPU LinearGradient Background (No un-linked native view managers needed!) */}
        <Rect x={0} y={0} width={w} height={h}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, h)}
            colors={gradientColors}
          />
        </Rect>

        {/* 2. Soft Glowing Cyan/Teal Nebula Gas Glow in Center/Bottom */}
        <Circle cx={w * 0.5} cy={h * 0.65} r={w * 0.75} color="rgba(40, 179, 163, 0.22)">
          <Blur blur={45} />
        </Circle>
        <Circle cx={w * 0.3} cy={h * 0.35} r={w * 0.5} color="rgba(110, 235, 217, 0.15)">
          <Blur blur={35} />
        </Circle>

        {/* 3. Layer A: Micro Distant Stars */}
        {microStars.map((star, i) => (
          <MicroStar key={`m-${i}`} star={star} time={time} h={h} />
        ))}

        {/* 4. Layer B: Floating Foreground Glowing Bokeh Dust */}
        {bokehStars.map((star, i) => (
          <BokehStar key={`b-${i}`} star={star} time={time} h={h} />
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
