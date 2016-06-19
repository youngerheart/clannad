var path = require('path');
var cooking = require('cooking');

cooking.set({
  entry: {
    app: './app/main.js',
    vendor: ['vue']
  },
  dist: './dist',
  template: './app/index.tpl',

  devServer: {
    port: 8080,
    publicPath: '/',
    extractCSS: true
  },

  // production
  clean: true,
  hash: true,
  sourceMap: true,
  chunk: 'vendor',
  publicPath: '/dist/',
  assetsPath: 'static',
  urlLoaderLimit: 10000,
  extractCSS: '[name].[contenthash:7].css',
  extends: ['vue', 'lint', 'saladcss']
});

cooking.add('resolve.alias', {
  'app': path.join(__dirname, 'app')
});

module.exports = cooking.resolve();
