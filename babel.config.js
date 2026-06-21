module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@services': './src/services',
            '@screens': './src/screens',
            '@components': './src/components',
            '@theme': './src/theme',
            '@locales': './src/locales',
            '@navigation': './src/navigation',
            '@types': './src/types',
            '@utils': './src/utils',
            '@hooks': './src/hooks'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
