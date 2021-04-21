export default {
  namespaced: true,
  state: {
    notes: [],
  },
  getters: {
    getNotesByfolderId: state => folderId => {
      const parsedId = Number(folderId);
      return state.notes.filter(note => note.folder_id === parsedId);
    },
    getNoteById: state => noteId => {
      const parsedId = Number(noteId);
      return state.notes.find(note => note.id === parsedId);
    },
  },
  mutations: {
    create(state, payload) {
      state.notes.push(payload);
    },
    update(state, payload) {
      const note = this.getters['note/getNoteById'](payload.id);

      if (note) {
        Object.assign(note, payload);
      } else {
        state.notes.push(payload);
      }
    },
    updates(state, payload) {
      state.notes = payload;
    },
    updatesByFolderId(state, payload) {
      const notes = state.notes.filter(note => note.folder_id !== payload.id);
      payload.notes.forEach(obj => {
        notes.push(obj);
      });
      state.notes = notes;
    },
    updateAndNoPush(state, payload) {
      const note = this.getters['note/getNoteById'](payload.id);

      if (note) {
        Object.assign(note, payload);
      }
    },
    delete(state, id) {
      const newNotes = state.notes.filter(note => note.id !== id);
      state.notes = newNotes;
    },
    clear(state) {
      state.notes = [];
    },
  },
  actions: {
    get({ commit, dispatch }, { id, projectId, folderId, searchQuery }) {
      // フォルダIDが0または存在しない場合、フォルダを指定せずノートを取得する
      const url = folderId
        ? `/projects/${projectId}/folders/${folderId}/notes/${id}`
        : `/projects/${projectId}/notes/${id}`;

      return dispatch(
        'http/get',
        {
          url,
          params: { search: searchQuery },
        },
        {
          root: true,
        }
      ).then(response => {
        commit('updateAndNoPush', response.data);
        return response.data;
      });
    },
    getNotesByProjectId({ commit, dispatch }, { projectId, page, shouldOverwrite, searchQuery }) {
      return dispatch(
        'http/get',
        {
          url: `/projects/${projectId}/notes`,
          params: { page, search: searchQuery },
        },
        {
          root: true,
        }
      ).then(response => {
        if (shouldOverwrite) {
          commit('clear');
        }
        response.data.forEach(d => {
          commit('update', d);
        });
        return response.data;
      });
    },
    getNotesByfolderId(
      { commit, dispatch },
      { projectId, folderId, page, shouldOverwrite, sortItem, sortOrder, searchQuery }
    ) {
      const sort = `${sortItem}:${sortOrder}`;

      return dispatch(
        'http/get',
        {
          url: `/projects/${projectId}/folders/${folderId}/notes`,
          params: { with_association: true, page, sort, search: searchQuery },
        },
        {
          root: true,
        }
      ).then(response => {
        if (shouldOverwrite) {
          commit('updatesByFolderId', response.data);
        } else {
          response.data.notes.forEach(note => {
            commit('update', note);
          });
        }

        const { id, name, description, lock_version } = response.data;
        commit('folder/update', { id, name, description, lock_version }, { root: true });
      });
    },
    create({ commit, dispatch }, { projectId, folderId }) {
      return dispatch(
        'http/post',
        { url: `/projects/${projectId}/folders/${folderId}/notes`, data: { note: {} } },
        { root: true }
      ).then(response => {
        commit('create', response.data);
        return response.data;
      });
    },
    update({ commit, dispatch, getters }, { id, projectId, folderId, title, text, htmltext }) {
      const note = getters.getNoteById(id);

      return dispatch(
        'http/put',
        {
          url: `/projects/${projectId}/folders/${folderId}/notes/${id}`,
          data: { note: { title, text, htmltext, lock_version: note.lock_version } },
        },
        { root: true }
      ).then(response => {
        commit('update', response.data);
      });
    },
    delete({ commit, dispatch }, { id, projectId, folderId }) {
      return dispatch(
        'http/delete',
        {
          url: `/projects/${projectId}/folders/${folderId}/notes/${id}`,
        },
        { root: true }
      ).then(() => {
        commit('delete', id);
      });
    },
    copy({ commit, dispatch }, note) {
      return dispatch(
        'http/post',
        { url: `/projects/${note.projectId}/folders/${note.folderId}/notes`, data: { ...note } },
        { root: true }
      ).then(response => {
        commit('create', response.data);
        return response.data;
      });
    },
    attachImage({ commit, dispatch, getters }, { id, projectId, images }) {
      const note = getters.getNoteById(id);

      return dispatch(
        'http/put',
        {
          url: `/projects/${projectId}/notes/${id}/images/attach`,
          data: { note: { lock_version: note.lock_version, images } },
        },
        { root: true }
      ).then(response => {
        commit('update', { id, lock_version: response.data.lock_version });
        return response.data;
      });
    },
  },
};
