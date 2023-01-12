module.exports = {
  configureWebpack: {
    output: {
      library: 'singleVue',
      libraryTarget: 'umd', // umd打包结果 window.singleVue.bootstarp/mount/unmount
    },
    devServer: {
      port: 10000,
    },
  },
}
