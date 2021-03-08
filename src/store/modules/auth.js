import constants from '../../consts/constants';

const getDefaultState = () => {
  return {
    id: null,
    name: null,
    email: null,
    avatar: '',
    header: {
      client: null,
      accessToken: null,
      uid: null,
      expiry: null,
      tokenType: null,
    },
  };
};

const createParamsState = response => {
  const { id, name, email, avatar } = response.data.data;
  const { client, uid, expiry } = response.headers;
  return {
    id,
    name,
    email,
    avatar,
    header: {
      client,
      uid,
      expiry,
      accessToken: response.headers['access-token'],
      tokenType: response.headers['token-type'],
    },
  };
};

export default {
  namespaced: true,
  state: getDefaultState(),
  // state: {
  //   id: 100,
  //   name: 'user01',
  //   email: 'example1@example.com',
  //   avatar: '',
  //   header: {
  //     client: 'jUBmtXblcwlcqtFlSh3qQQ',
  //     accessToken: 'nf0nQZkkSMKyuoaJc8B5pw',
  //     uid: 'example1@example.com',
  //     expiry: '1614283493',
  //     tokenType: 'Bearer',
  //   },
  // },
  // state: {
  //   id: 10,
  //   name: 'test3',
  //   email: 'test3@example.com',
  //   imageFile: '',
  //   imageName: '',
  //   avatar: '',
  //   header: {
  //     client: 'qahr-YcuoZKEBH3CglBgfQ',
  //     accessToken: 'b_CVN_MXMHmsdSrZZYovEA',
  //     uid: 'test3@example.com',
  //     expiry: '1614533046',
  //     tokenType: 'Bearer',
  //   },
  // },
  getters: {
    isAuthorized: state => {
      return !!state.header.accessToken;
    },
  },
  mutations: {
    update(state, { id, name, email, avatar, header }) {
      Object.assign(state, { id, name, email, avatar, header });
    },
    signout(state) {
      Object.assign(state, getDefaultState());
    },
    updateHeader(state, payload) {
      Object.assign(state.header, payload);
    },
    updateExceptHeader(state, { id, name, email, avatar }) {
      Object.assign(state, { id, name, email, avatar });
    },
    deleteAvatar(state) {
      Object.assign(state, { avatar: '' });
    },
  },
  actions: {
    signin({ dispatch, commit }, data) {
      return dispatch('http/post', { url: `/auth/sign_in`, data }, { root: true }).then(response => {
        commit('update', createParamsState(response));
      });
    },
    signin_sample({ dispatch, commit }) {
      return dispatch('http/post', { url: `/auth/sign_in_sample` }, { root: true }).then(response => {
        commit('update', createParamsState(response));
      });
    },
    signup({ dispatch, commit }, data) {
      return dispatch('http/post', { url: `/auth/sign_up`, data }, { root: true }).then(response => {
        commit('update', createParamsState(response));
      });
    },
    signout({ dispatch, commit }) {
      return dispatch('http/delete', { url: `/auth/sign_out` }, { root: true }).then(() => {
        commit('signout');
        commit('project/delete', {}, { root: true });
        window.localStorage.removeItem(constants.VUEX_PERSISTED_STATE_KEY);
      });
    },
    get({ dispatch, commit, state }) {
      return dispatch(
        'http/get',
        {
          url: `/auth/validate_token`,
        },
        {
          root: true,
        }
      ).then(response => {
        commit('updateExceptHeader', response.data.data);
        return state;
      });
    },
    update({ dispatch, commit }, data) {
      return dispatch(
        'http/put',
        {
          url: `/auth`,
          data,
        },
        { root: true }
      ).then(response => {
        commit('updateExceptHeader', response.data.data);
      });
    },
    resetPassword({ dispatch }, email) {
      return dispatch('http/post', { url: `/auth/password`, data: { email } }, { root: true });
    },
    updatePassword({ dispatch, commit }, data) {
      commit('updateHeader', data.header);
      return dispatch(
        'http/put',
        {
          url: `/auth/password`,
          data: { password: data.password, password_confirmation: data.passwordConfirmation },
        },
        { root: true }
      );
    },
    updateCurrentPassword({ dispatch }, { currentPassword, password, passwordConfirmation }) {
      return dispatch(
        'http/put',
        {
          url: `/auth`,
          data: { current_password: currentPassword, password, password_confirmation: passwordConfirmation },
        },
        { root: true }
      );
    },
    deleteAvatar({ dispatch, commit }, avatar) {
      if (!avatar) {
        return Promise.resolve();
      }

      return dispatch(
        'http/delete',
        {
          url: `/auth/avatar`,
        },
        { root: true }
      ).then(() => {
        commit('deleteAvatar');
      });
    },
    delete({ dispatch, commit, state }) {
      return dispatch('deleteAvatar', state.avatar).then(() => {
        return dispatch(
          'http/delete',
          {
            url: `/auth`,
          },
          { root: true }
        ).then(() => {
          commit('signout');
        });
      });
    },
  },
};
