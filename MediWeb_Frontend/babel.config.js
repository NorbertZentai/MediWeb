module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            api: './src/api',
            assets: './src/assets',
            components: './src/components',
            contexts: './src/contexts',
            features: './src/features',
            routes: './src/routes',
            styles: './src/styles',
            utils: './src/utils',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};