import axios from 'axios';
import constants from '../../consts/constants';

axios.defaults.baseURL = process.env.VUE_APP_API_URL;

export default {
  namespaced: true,
  state: {
    isLoading: false,
    isRedirecting: false,
  },
  mutations: {
    setLoading(state, bool) {
      state.isLoading = bool;
    },
    setRedirecting(state, bool) {
      state.isRedirecting = bool;
    },
  },
  actions: {
    async request({ rootState, commit, dispatch, state }, { method, url, data, params }) {
      const headers = {};
      headers['Content-Type'] = 'application/json';
      if (rootState.auth.header.accessToken) {
        headers.client = rootState.auth.header.client;
        headers['access-token'] = rootState.auth.header.accessToken;
        headers.expiry = rootState.auth.header.expiry;
        headers['token-type'] = rootState.auth.header.TokenType;
        headers.uid = rootState.auth.header.uid;
      }
      const options = {
        method,
        url,
        headers,
        data,
        params,
        timeout: constants.API_TIMEOUT,
      };

      // ローディングを設定
      let isResponsed = false;
      const timerId = setInterval(() => {
        if (isResponsed) {
          commit('setLoading', false);
          clearInterval(timerId);
        } else {
          commit('setLoading', true);
        }
      }, constants.API_LOADING_START_TIME);

      // リダイレクト中の場合はエラーをクリアしない。
      if (!state.isRedirecting) {
        dispatch('error/clearError', {}, { root: true });
      }

      return axios(options)
        .then(response => response)
        .catch(error => {
          dispatch('error/setError', error, { root: true });
          throw error;
        })
        .finally(() => {
          isResponsed = true;
        });
    },

    async get({ dispatch }, requests) {
      requests.method = 'get';
      return dispatch('request', requests);
    },

    async post({ dispatch }, requests) {
      requests.method = 'post';
      return dispatch('request', requests);
    },

    async put({ dispatch }, requests) {
      requests.method = 'put';
      return dispatch('request', requests);
    },

    async delete({ dispatch }, requests) {
      requests.method = 'delete';
      return dispatch('request', requests);
    },
  },
};
