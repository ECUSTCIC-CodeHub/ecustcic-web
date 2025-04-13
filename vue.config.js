const webpack = require("webpack");
const moment = require('moment');

module.exports = {
  publicPath: '/',
  lintOnSave: process.env.NODE_ENV !== 'production',

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.BUILD_TIME': JSON.stringify(moment().format('YYYY年M月D日'))
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default']
      })
    ]
  }
}