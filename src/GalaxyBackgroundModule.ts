import { NativeModule, requireNativeModule } from 'expo';

declare class GalaxyBackgroundModule extends NativeModule<{}> {}

export default requireNativeModule<GalaxyBackgroundModule>('GalaxyBackground');
