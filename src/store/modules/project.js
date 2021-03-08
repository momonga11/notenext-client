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
  // state: {
  //   id: 17,
  //   name: 'project',
  //   description:
  //     'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  //   lock_version: 0,
  // },
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
