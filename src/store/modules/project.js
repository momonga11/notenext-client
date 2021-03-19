const getDefaultState = () => {
  return {
    id: null,
    name: null,
    description: null,
    lock_version: null,
  };
};

const getTemporaryData = () => {
  return {
    name: 'あなたのプロジェクト',
    description: null,
  };
};

export default {
  namespaced: true,
  state: getDefaultState(),
  mutations: {
    update(state, payload) {
      Object.assign(state, payload);
    },
    delete(state) {
      Object.assign(state, getDefaultState());
    },
  },
  actions: {
    get({ state, commit, dispatch }, id) {
      return dispatch('http/get', { url: `/projects/${id}` }, { root: true }).then(response => {
        commit('update', response.data);
        return state;
      });
    },
    getWithAssociation({ dispatch, commit }, projectId) {
      return dispatch(
        'http/get',
        { url: `/projects/${projectId}`, params: { with_association: true } },
        { root: true }
      ).then(response => {
        const { id, name } = response.data;
        commit('update', { id, name });
        commit('folder/updates', response.data.folders, { root: true });
        commit('auth/updateExceptHeader', response.data.user, { root: true });
      });
    },
    getProjects({ dispatch }) {
      return dispatch('http/get', { url: `/projects/` }, { root: true }).then(response => {
        return response.data;
      });
    },
    create({ dispatch }) {
      return dispatch(
        'http/post',
        { url: `/projects/`, data: { project: { ...getTemporaryData() } } },
        { root: true }
      ).then(response => {
        return response.data;
      });
    },
    update({ state, commit, dispatch }, { id, name, description }) {
      return dispatch(
        'http/put',
        { url: `/projects/${id}`, data: { project: { name, description, lock_version: state.lock_version } } },
        { root: true }
      ).then(response => {
        commit('update', response.data);
      });
    },
    delete({ state, commit, dispatch }) {
      return dispatch('http/delete', { url: `/projects/${state.id}` }, { root: true }).then(() => {
        commit('delete');
      });
    },
  },
};
