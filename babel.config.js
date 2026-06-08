module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Order matters: metadata must be emitted BEFORE the decorators are
    // transformed, and both must run before babel-preset-expo's class transforms.
    // This is what makes Inversify's @injectable / @inject work at runtime.
    plugins: [
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};
