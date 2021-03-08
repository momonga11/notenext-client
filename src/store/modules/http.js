import axios from 'axios';

// TODO: 環境変数からとる
axios.defaults.baseURL = process.env.VUE_APP_API_URL;

// axios.interceptors.request.use(
//   config => {
//     if (this.state.auth['access-token']) {
//       config.headers.client = this.state.auth.client;
//       config.headers['access-token'] = this.state.auth['access-token'];
//       config.headers.expiry = this.state.auth.expiry;
//       config.headers['token-type'] = this.state.auth['token-type'];
//       config.headers.uid = this.state.auth.uid;
//     }

//     config.timeout = process.env.VUE_APP_API_TIMEOUT;
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   }
// );

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
        timeout: process.env.VUE_APP_API_TIMEOUT,
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
      }, process.env.VUE_APP_API_LOADING_START_TIME);

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

    // async request({ rootState }, options) {
    //   const headers = {};
    //   headers['Content-Type'] = 'application/json';
    //   if (rootState.auth['access-token']) {
    //     headers.client = rootState.auth.client;
    //     headers['access-token'] = rootState.auth['access-token'];
    //     headers.expiry = rootState.auth.expiry;
    //     headers['token-type'] = rootState.auth['token-type'];
    //     headers.uid = rootState.auth.uid;
    //   }

    //   options.headers = headers;
    //   options.timeout = process.env.VUE_APP_API_TIMEOUT;

    //   return axios(options)
    //     .then(response => response)
    //     .catch(error => error);
    // },

    // async get({ dispatch }, { url, params }) {
    //   const options = {
    //     method: 'get',
    //     url,
    //     params,
    //   };

    //   return dispatch('request', options);
    // },
    async get({ dispatch }, requests) {
      requests.method = 'get';
      return dispatch('request', requests);

      //   const options = {
      //     url: requests.url,
      //     params: requests.params,
      //   };

      //   return axios
      //     .get(options)
      //     .then(response => response)
      //     .catch(error => error);
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
