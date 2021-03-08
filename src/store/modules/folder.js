export default {
  namespaced: true,
  state: {
    folders: [],
  },
  getters: {
    getFolderById: state => folderId => {
      const parsedId = Number(folderId);
      return state.folders.find(folder => folder.id === parsedId);
    },
  },
  mutations: {
    create(state, payload) {
      state.folders.push(payload);
    },
    update(state, payload) {
      const folder = this.getters['folder/getFolderById'](payload.id);
      if (folder) {
        Object.assign(folder, payload);
      } else {
        state.folders.push(payload);
      }
    },
    updates(state, payload) {
      // 複数のフォルダ情報が引数に渡させるため、stateを置き換える
      state.folders = payload;
    },
    delete(state, id) {
      const newFolders = state.folders.filter(folder => folder.id !== id);
      state.folders = newFolders;
    },
  },
  actions: {
    get({ commit, dispatch, getters }, { id, projectId }) {
      return dispatch(
        'http/get',
        {
          url: `/projects/${projectId}/folders/${id}`,
        },
        {
          root: true,
        }
      ).then(response => {
        commit('update', response.data);
        return getters.getFolderById(id);
      });
    },
    create({ commit, dispatch }, { name, description, projectId }) {
      return dispatch(
        'http/post',
        { url: `/projects/${projectId}/folders`, data: { folder: { name, description } } },
        { root: true }
      ).then(response => {
        commit('create', response.data);
      });
    },
    update({ commit, dispatch }, { id, name, description, lockVersion, projectId }) {
      return dispatch(
        'http/put',
        {
          url: `/projects/${projectId}/folders/${id}`,
          data: { folder: { name, description, lock_version: lockVersion } },
        },
        { root: true }
      ).then(response => {
        commit('update', response.data);
      });
    },
    delete({ commit, dispatch }, { id, projectId }) {
      return dispatch(
        'http/delete',
        {
          url: `/projects/${projectId}/folders/${id}`,
        },
        { root: true }
      ).then(() => {
        commit('delete', id);
      });
    },
  },
};
