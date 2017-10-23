var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = function (options) {
  return {
    entry: resolve('src/index.js'),
    output: {
      filename: 'jquery.magic.search.js',
      path: resolve('dist')
    },
    module: {
      rules: [{
          test: /\.js$/,
          loader: 'babel-loader',
          include: [resolve('src')],
          exclude: [resolve('/node_modules/')]
        },
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: "css-loader"
          }),
          include: [resolve('src')],
          exclude: [resolve('/node_modules/')]
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'img/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'media/[name].[hash:7].[ext]'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'fonts/[name].[hash:7].[ext]'
          }
        }
      ]
    },
    plugins: [
      new ExtractTextPlugin("styles.css"),
    ]
  };
};