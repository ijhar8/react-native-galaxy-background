// Reexport the native module. On web, it will be resolved to GalaxyBackgroundModule.web.ts
// and on native platforms to GalaxyBackgroundModule.ts
export { default } from './GalaxyBackgroundModule';
export * from './GalaxyBackground.types';
