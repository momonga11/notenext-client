export default {
  namespaced: true,
  state: {
    folders: [],
    foldersAction: [], // 実行したソートの順番を記録するための変数 { id:1, sortItem:'updated_at', sortOrder:'asc' }
  },
  getters: {
    getFolderById: state => folderId => {
      const parsedId = Number(folderId);
      return state.folders.find(folder => folder.id === parsedId);
    },
    getFolderActionById: state => folderId => {
      const parsedId = Number(folderId);
      return state.foldersAction.find(folder => folder.id === parsedId);
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

      const newFoldersAction = state.foldersAction.filter(folder => folder.id !== id);
      state.foldersAction = newFoldersAction;
    },
    clear(state) {
      state.folders = [];
      state.foldersAction = [];
    },
    setFolderAction(state, payload) {
      const folderAction = this.getters['folder/getFolderActionById'](payload.id);
      if (folderAction) {
        Object.assign(folderAction, payload);
      } else {
        state.foldersAction.push(payload);
      }
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
    getFolders({ commit, dispatch }, { projectId }) {
      return dispatch(
        'http/get',
        {
          url: `/projects/${projectId}/folders`,
        },
        {
          root: true,
        }
      ).then(response => {
        commit('updates', response.data);
      });
    },
    getFoldersExistsNote({ commit, dispatch }, { projectId, searchQuery }) {
      return dispatch(
        'http/get',
        {
          url: `/projects/${projectId}/folders`,
          params: { note: true, search: searchQuery },
        },
        {
          root: true,
        }
      ).then(response => {
        commit('updates', response.data);
      });
    },
  },
};
