import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader
import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: 'mdi', // default - only for display purposes
  },
  theme: {
    themes: {
      light: {
        primary: '#45e8b7',
        // primary: '#4ee097',
        secondary: '#00a385',
        accent: '#3dcc9e',
        error: '#f44336',
        warning: '#ffeb3b',
        info: '#03a9f4',
        success: '#00C853',
      },
    },
  },
});
