import GalaxyBackgroundView from './GalaxyBackgroundView';
import type {
  GalaxyBackgroundProps,
  GalaxyDirection,
  GalaxyZoom,
  GalaxyTheme,
  StarConfig,
  DustConfig,
} from './GalaxyBackgroundView';

export {
  GalaxyBackgroundView,
  GalaxyBackgroundProps,
  GalaxyDirection,
  GalaxyZoom,
  GalaxyTheme,
  StarConfig,
  DustConfig,
};

export default GalaxyBackgroundView;

// ── VideoBackground Module ─────────────────────────────────────────────────
export {
  VideoBackground,
  VideoPoolProvider,
  useVideoPool,
} from './VideoBackground';

export type {
  VideoBackgroundProps,
  VideoPoolProviderProps,
  VideoPoolContextValue,
  PreloadEntry,
  VideoPlayerStatus,
  VideoContentFit,
} from './VideoBackground';
