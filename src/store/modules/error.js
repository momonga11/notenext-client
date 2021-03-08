import message from '../../consts/message';
import constants from '../../consts/constants';

const getDefaultState = () => {
  return { status: '', message: '' };
};

export default {
  namespaced: true,
  state: {
    status: '',
    message: '',
  },
  mutations: {
    create(state, payload) {
      state.status = payload.status;
      state.message = payload.message;
    },
    delete(state) {
      Object.assign(state, getDefaultState());
    },
  },
  actions: {
    setError({ commit }, error) {
      const { response } = error;
      if (response) {
        const { status, data } = response;
        if (data.errors) {
          // API Error
          switch (response.status) {
            case constants.HTTP_STATUS_UNAUTHORIZED:
              // 401(unauthorized)の場合、認証に失敗しているため、認証情報をクリアし、再ログインを促す。
              commit('auth/signout', {}, { root: true });
              commit('create', { status, message: data.errors.join(',') });
              break;
            case constants.HTTP_STATUS_UNPROCESSABLE_ENTITY:
              // 422(API標準エラー)の場合、複数メッセージをまとめて表示する
              if (data.errors.full_messages) {
                commit('create', { status, message: data.errors.full_messages });
              } else {
                commit('create', { status, message: data.errors.join(',') });
              }
              break;
            default:
              commit('create', { status, message: data.errors.join(',') });
              break;
          }
        } else {
          // API Server Error
          commit('create', { status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, message: message.UNKNOWN_ERROR });
        }
      } else if (error.message) {
        // TODO: Network Error のメッセージ
        commit('create', { status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, message: message.NETWORK_ERROR });
      } else {
        // TODO: 原因不明のエラーの場合
        commit('create', { status: constants.HTTP_STATUS_INTERNAL_SERVER_ERROR, message: message.UNKNOWN_ERROR });
      }
    },
    clearError({ commit }) {
      commit('delete');
    },
  },
};
