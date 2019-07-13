const webpack = require('webpack');
const path = require('path');
const projectPkg = require(path.resolve(process.cwd(), 'package.json'));

const config = {
  entry: {
    index: path.join(process.cwd(), 'src', 'index.js')
  },
  output: {
    path: path.resolve(process.cwd()),
    filename: 'index.js',
    library: 'VKUIConnect',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: `typeof self !== 'undefined' ? self : this`
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            ['@babel/preset-env', {
              targets: {
                browsers: projectPkg.browserslist
              }
            }]
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.PACKAGE_VERSION': JSON.stringify(projectPkg.version)
    })
  ],
  optimization: {
    minimize: false
  },
  devtool: 'source-map',
  stats: {
    children: false
  }
};

module.exports = config;
