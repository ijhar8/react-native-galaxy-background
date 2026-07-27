import { registerWebModule, NativeModule } from 'expo';

class GalaxyBackgroundModule extends NativeModule<{}> {}

export default registerWebModule(GalaxyBackgroundModule, 'GalaxyBackgroundModule');
