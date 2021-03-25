module.exports = {
  devServer: {
    port: process.env.VUE_APP_PORT,
  },
  transpileDependencies: ['vuetify'],
  configureWebpack: {
    devtool: 'source-map',
  },
};
