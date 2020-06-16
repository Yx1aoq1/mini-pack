const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: 'development',
  entry: resolve('./src/index.js'),
  output: {
    path: resolve('./dist'),
    filename: '[name].js',
    pathinfo: false
  },
  optimization: {
    concatenateModules: true,
  },
  module: {
    rules: [
      { 
        test: /\.js$/,
        include: resolve('src'),
        loader: 'babel-loader',
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html'
    })
  ]
}