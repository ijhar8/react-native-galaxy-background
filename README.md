# react-native-galaxy-background 🌌

A high-performance, **60–120 FPS GPU-accelerated Galaxy Background component** for React Native and Expo applications. 

Powered by **React Native Skia** for GPU canvas rendering and **React Native Reanimated** worklets for native C++ UI-thread frame calculations with **zero JS thread overhead**.

---

## ✨ Features

- ⚡ **60–120 FPS Native Performance**: Powered by `@shopify/react-native-skia` GPU canvas & C++ Reanimated UI-thread worklets (`'worklet'`). Zero JS thread frame drops.
- 🎬 **Video Background System (`expo-video`)**: Production-grade `<VideoBackground>` component with Reanimated poster cross-fade, Android `surfaceType="textureView"` z-fighting fix, and focus-aware auto-pause.
- 🏊 **Global Video Player Pool (`VideoPoolProvider`)**: Pre-warm native video decoders at app startup to eliminate video loading delay (~0ms playback).
- 🌌 **Deep Space Galaxy Aesthetics**: Soft GPU blur nebula gas clouds, 4-point sparkling star flares ⭐, and customizable theme palettes (`'blue'`, `'sunset'` / `'orange'`, `'dark'`).
- 🔄 **7 Flow Direction Modes**: Supports `'still'`, `'bottom'`, `'top'`, `'left'`, `'right'`, `'360'`, and `'random'` particle motion modes.
- 🎛️ **Granular Controls**: Independently configure star counts (`numStars`), dust counts (`numDust`), star radius (`starRadius`), dust radius (`dustRadius`), and motion speed (`speedMultiplier`).
- 📦 **TypeScript Ready**: Full TSDoc comments and exported TypeScript types for instant IDE auto-complete / IntelliSense.

---

## 🛠️ Two Flexible Integration Options

You can use this project in **two ways** depending on your team's workflow:

### Option A: Install as an NPM Library 📦
Install the published package directly from npm:

```bash
# npm
npm install react-native-galaxy-background @shopify/react-native-skia react-native-reanimated expo-video

# yarn
yarn add react-native-galaxy-background @shopify/react-native-skia react-native-reanimated expo-video

# expo
npx expo install react-native-galaxy-background @shopify/react-native-skia react-native-reanimated expo-video
```

```tsx
import GalaxyBackgroundView, { VideoBackground, VideoPoolProvider } from 'react-native-galaxy-background';
```

---

### Option B: Copy Components Directly into Your Codebase 📂
If you prefer zero external package dependencies or want full customization control, simply **copy the source files directly into your project**:

> 💡 **100% Modular & Independent**: Both components are completely decoupled!
> - Want **only Video Background**? Copy `src/VideoBackground/` and install `expo-video` + `react-native-reanimated`. (Skia is NOT required!)
> - Want **only Galaxy Skia Background**? Copy `src/GalaxyBackgroundView.tsx` and install `@shopify/react-native-skia` + `react-native-reanimated`. (`expo-video` is NOT required!)

1. **Copy Component Files**:
   - For Video Background: Copy `src/VideoBackground/` → `components/VideoBackground/`
   - For Galaxy Skia Background: Copy `src/GalaxyBackgroundView.tsx` → `components/GalaxyBackgroundView.tsx`

2. **Install Peer Dependencies**:
   ```bash
   npx expo install @shopify/react-native-skia react-native-reanimated expo-video
   ```

3. **Import Locally**:
   ```tsx
   import GalaxyBackgroundView from './components/GalaxyBackgroundView';
   import { VideoBackground, VideoPoolProvider } from './components/VideoBackground';
   ```

---

## 🚀 Usage Examples

### Example 1: Standard Blue Galaxy (Teal/Cyan `#28B3A3`)

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GalaxyBackgroundView from 'react-native-galaxy-background';

export default function App() {
  return (
    <GalaxyBackgroundView
      numStars={200}
      numDust={100}
      direction="360"
      speedMultiplier={1.0}
      theme="blue"
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Blue Galaxy</Text>
      </View>
    </GalaxyBackgroundView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
});
```

### Example 2: Warm Amber / Sunset Orange Cosmic Sky 🌅

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import GalaxyBackgroundView from 'react-native-galaxy-background';

export default function SunsetApp() {
  return (
    <GalaxyBackgroundView
      numStars={250}
      numDust={120}
      direction="random"
      speedMultiplier={0.8}
      theme="sunset" // Or theme="orange"
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Sunset Cosmic Sky</Text>
      </View>
    </GalaxyBackgroundView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
});
```

### Example 3: Hardware-Decoded Video Background 🎬

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { VideoBackground, VideoPoolProvider } from 'react-native-galaxy-background';
import { useIsFocused } from '@react-navigation/native';

export default function App() {
  return (
    // Pre-warm decoders at app startup (optional)
    <VideoPoolProvider preload={[
      { key: 'splash', source: require('./assets/deep_space.mp4') },
    ]}>
      <VideoBackground
        poolKey="splash"
        source={require('./assets/deep_space.mp4')}
        posterSource={require('./assets/deep_space_poster.jpg')}
        isLooping={true}
        isMuted={true}
        contentFit="cover"
        fadeDuration={600}
        isFocused={useIsFocused()} // Auto-pauses on screen blur
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Deep Space Video</Text>
        </View>
      </VideoBackground>
    </VideoPoolProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
});
```

---

## 🎛️ Props API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `numStars` | `number` | `200` | Exact count of small star particles (includes 15% 4-point sparkles ⭐). Set to `0` to disable stars. |
| `numDust` | `number` | `100` | Exact count of soft cosmic dust particles. Set to `0` to disable dust layer. |
| `starRadius` | `number` | `0.7` | Base radius size (in pixels) for star particles. |
| `dustRadius` | `number` | `0.5` | Base radius size (in pixels) for cosmic dust particles. |
| `direction` | `GalaxyDirection` | `'360'` | Particle flow direction: `'still'`, `'bottom'`, `'top'`, `'left'`, `'right'`, `'360'`, `'random'`, `'zoom-in'`, `'zoom-out'`. |
| `zoom` | `GalaxyZoom` | `'none'` | Cinematic camera zoom depth: `'none'`, `'in'`, `'out'`, `'breathe'`, `'pulse'`. |
| `zoomSpeed` | `number` | `1.0` | Camera zoom motion speed multiplier. |
| `speedMultiplier`| `number` | `1.0` | Global particle movement speed multiplier. |
| `theme` | `GalaxyTheme` | `'blue'` | Background color gradient theme: `'blue'`, `'sunset'` / `'orange'`, `'dark'`. |
| `children` | `ReactNode` | `undefined` | Foreground UI components rendered above the background canvas. |
| `style` | `ViewStyle` | `undefined` | Container view style overrides. |

---

## 🎨 Flow Direction & Warp Zoom Modes (`direction`)

- **`'zoom-in'` / `'zoom'`**: 🚀 **3D Warp Zoom In** — Particles expand outward from center as if traveling forward through deep space towards the viewer.
- **`'zoom-out'`**: 🌌 **3D Warp Zoom Out** — Particles contract inward towards the distant center vanishing point as if flying away.
- **`'360'`**: 🌀 Particles orbit in a continuous 360-degree spiral galaxy vortex around the center.
- **`'bottom'`**: Particles drift continuously from bottom to top (upward flow).
- **`'top'`**: Particles drift continuously from top to bottom (downward flow).
- **`'left'`**: Particles drift continuously from right to left (leftward flow).
- **`'right'`**: Particles drift continuously from left to right (rightward flow).
- **`'still'`**: Particles stay in fixed positions with subtle breathing opacity.
- **`'random'`**: Particles move in multi-directional floating random vectors.

---

## 🔍 Camera Zoom Depth (`zoom`)

- **`'none'`**: Standard motion without camera depth animation.
- **`'in'`**: Layered forward camera zoom traveling closer to deep space.
- **`'out'`**: Layered backward camera zoom traveling away into the distance.
- **`'breathe'` / `'pulse'`**: 🌊 Smooth cinematic oscillatory camera breathing (slow in-and-out depth motion).

---

## 📄 License

MIT © [Ijhar Ansari](https://github.com/ijhar8)
