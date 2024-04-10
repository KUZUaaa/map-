
module.exports = {
          publicPath: '',
          chainWebpack: config => {
            config.plugin('preload')
              .tap(args => {
                args[0].fileBlacklist.push(/\.css/, /\.js/)
                return args
              })
            config.plugin('inline-source')
              .use(require('html-webpack-inline-source-plugin'))
            config
              .plugin('html')
              .tap(args => {
                args[0].title = '正负面清单'
                args[0].inlineSource = '(\.css|\.js$)'
                return args
              })
          },
          productionSourceMap: false,
          devServer: {
            https: false
          }
        }