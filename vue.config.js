const webpack = require("webpack");

module.exports = {
  publicPath: '/',
  lintOnSave: process.env.NODE_ENV !== 'production',

  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
        Popper: ['popper.js', 'default']
      })
    ]
  }
}