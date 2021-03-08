import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import SecureLS from 'secure-ls';
import constants from '../consts/constants';
import project from './modules/project';
import folder from './modules/folder';
import note from './modules/note';
import auth from './modules/auth';
import http from './modules/http';
import error from './modules/error';

Vue.use(Vuex);

const ls = new SecureLS({ encodingType: 'aes', isCompression: false });
const persistedstate = createPersistedState({
  key: constants.VUEX_PERSISTED_STATE_KEY,
  paths: ['auth.header', 'project'],
  storage: {
    getItem: key => ls.get(key),
    setItem: (key, value) => ls.set(key, value),
    removeItem: key => ls.remove(key),
  },
});

export default new Vuex.Store({
  modules: {
    project,
    folder,
    note,
    auth,
    http,
    error,
  },
  plugins: [persistedstate],
});
