# react-native-galaxy-background 🌌

A high-performance, **60–120 FPS GPU-accelerated Galaxy Background component** for React Native and Expo applications. 

Powered by **React Native Skia** for GPU canvas rendering and **React Native Reanimated** worklets for native C++ UI-thread frame calculations with **zero JS thread overhead**.

---

## ✨ Features

- ⚡ **60–120 FPS Native Performance**: Powered by `@shopify/react-native-skia` GPU canvas & C++ Reanimated UI-thread worklets (`'worklet'`). Zero JS thread frame drops.
- 🌌 **Deep Space Galaxy Aesthetics**: Soft GPU blur nebula gas clouds, 4-point sparkling star flares ⭐, and customizable theme palettes (`'blue'`, `'sunset'` / `'orange'`, `'dark'`).
- 🔄 **7 Flow Direction Modes**: Supports `'still'`, `'bottom'`, `'top'`, `'left'`, `'right'`, `'360'`, and `'random'` particle motion modes.
- 🎛️ **Granular Particle Controls**: Independently configure star counts (`numStars`), dust counts (`numDust`), star radius (`starRadius`), dust radius (`dustRadius`), and motion speed (`speedMultiplier`).
- 📦 **TypeScript Ready**: Full TSDoc comments and exported TypeScript types for instant IDE auto-complete / IntelliSense.

---

## 📦 Installation

```bash
# npm
npm install react-native-galaxy-background @shopify/react-native-skia react-native-reanimated

# yarn
yarn add react-native-galaxy-background @shopify/react-native-skia react-native-reanimated

# expo
npx expo install react-native-galaxy-background @shopify/react-native-skia react-native-reanimated
```

> **Note**: Requires `@shopify/react-native-skia` (>= 1.0.0) and `react-native-reanimated` (>= 3.0.0).

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

---

## 🎛️ Props API Reference

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `numStars` | `number` | `200` | Exact count of small star particles (includes 15% 4-point sparkles ⭐). Set to `0` to disable stars. |
| `numDust` | `number` | `100` | Exact count of soft cosmic dust particles. Set to `0` to disable dust layer. |
| `starRadius` | `number` | `0.7` | Base radius size (in pixels) for star particles. |
| `dustRadius` | `number` | `0.5` | Base radius size (in pixels) for cosmic dust particles. |
| `direction` | `GalaxyDirection` | `'360'` | Particle flow direction: `'still'`, `'bottom'`, `'top'`, `'left'`, `'right'`, `'360'`, `'random'`. |
| `speedMultiplier`| `number` | `1.0` | Global particle movement speed multiplier. |
| `theme` | `GalaxyTheme` | `'blue'` | Background color gradient theme: `'blue'`, `'sunset'` / `'orange'`, `'dark'`. |
| `children` | `ReactNode` | `undefined` | Foreground UI components rendered above the background canvas. |
| `style` | `ViewStyle` | `undefined` | Container view style overrides. |

---

## 🎨 Flow Direction Modes (`direction`)

- **`'360'`**: Particles orbit in a continuous 360-degree spiral galaxy vortex around the center.
- **`'bottom'`**: Particles drift continuously from bottom to top (upward flow).
- **`'top'`**: Particles drift continuously from top to bottom (downward flow).
- **`'left'`**: Particles drift continuously from right to left (leftward flow).
- **`'right'`**: Particles drift continuously from left to right (rightward flow).
- **`'still'`**: Particles stay in fixed positions with subtle breathing opacity.
- **`'random'`**: Particles move in multi-directional floating random vectors.

---

## 📄 License

MIT © [Ijhar Ansari](https://github.com/ijhar8)
