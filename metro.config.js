// This file is used to configure Metro bundler for a React Native project.
// Metro is the JavaScript bundler used by React Native.
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = defaultConfig;

defaultConfig.resolver.unstable_enablePackageExports = false;