module.exports = {
  devServer: {
    port: process.env.VUE_APP_PORT,
    watchOptions: {
      poll: true,
    },
  },
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devtool: 'source-map',
  },
};
