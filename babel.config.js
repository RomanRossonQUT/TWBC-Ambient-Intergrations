module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        plugins: ['react-native-paper/babel']
      }
    },
    plugins: [
      'react-native-reanimated/plugin',
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
