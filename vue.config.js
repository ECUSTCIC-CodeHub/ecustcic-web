const webpack = require("webpack");
const moment = require('moment');

module.exports = {
  publicPath: '/',
  lintOnSave: process.env.NODE_ENV !== 'production',

  devServer: {
    historyApiFallback: {
      rewrites: [
        // /tech/ 下的路径不回退到主站 index.html，让静态文件正常服务
        { from: /^\/tech\/.*/, to: context => context.parsedUrl.pathname },
        // 其他路径回退到主站 SPA
        { from: /./, to: '/index.html' }
      ]
    }
  },

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