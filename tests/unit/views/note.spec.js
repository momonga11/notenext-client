import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import Note from '@/views/Note.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock, rejectError } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

jest.useFakeTimers();

describe('Note.vue', () => {
  let wrapper;
  let store;
  let projectStoreMock;
  let noteStoreMock;
  let folderStoreMock;
  let vuetify;
  let newNoteId;
  let newImageUrl;
  let mockError;
  let mockErrorStatus;
  let noteIdForGetAction;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;
    mockErrorStatus = 403;
    newNoteId = 100;
    newImageUrl = 'https://test/test-image.png';
    noteIdForGetAction = 1;

    const stateNote = {
      notes: [
        {
          id: 10,
          folder_id: 1,
          title: 'note-title1',
          text: 'note-text1',
          htmltext: '<div>note-text1</div>',
          created_at: new Date('2021/1/1 1:2:3'),
          updated_at: new Date('2021/1/2 4:5:6'),
        },
        {
          id: 11,
          folder_id: 1,
          title: 'note-title11',
          text: 'note-text11',
          htmltext: '<div>note-text11</div>',
          created_at: new Date('2021/1/11 2:3:4'),
          updated_at: new Date('2021/1/12 5:6:7'),
        },
        {
          id: 20,
          folder_id: 2,
          title: 'note-title2',
          text: 'note-text2',
          htmltext: '<div>note-text2</div>',
          created_at: new Date('2021/2/1 11:12:13'),
          updated_at: new Date('2021/2/2 12:13:14'),
        },
        {
          id: 21,
          folder_id: 2,
          title: 'note-title22',
          text: 'note-text22',
          htmltext: '<div>note-text22</div>',
          created_at: new Date('2021/2/11 21:22:23'),
          updated_at: new Date('2021/2/12 22:23:24'),
        },
      ],
    };

    // Vuexストアのモックを作成する
    noteStoreMock = {
      namespaced: true,
      state: stateNote,
      getters: {
        getNotesByfolderId: jest.fn().mockImplementation(store => folderId => {
          return stateNote.notes.filter(note => note.folder_id === folderId);
        }),
      },
      actions: {
        get: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve(stateNote.notes[noteIdForGetAction]);
          }
          const error = { response: { status: mockErrorStatus } };
          return Promise.reject(error);
        }),
        getNotesByfolderId: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        update: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        delete: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        copy: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve({ id: newNoteId });
          }
          return rejectError(wrapper);
        }),
        attachImage: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve({ image_url: newImageUrl });
          }
          return rejectError(wrapper);
        }),
      },
    };

    folderStoreMock = {
      namespaced: true,
      state: {
        folders: [
          { id: 1, name: 'test-folder-name', description: 'test-folder-description', lock_version: 0 },
          { id: 2, name: 'test-folder-name2', description: 'test-folder-description2', lock_version: 0 },
        ],
      },
      getters: {
        getFolderById: jest.fn().mockImplementation(state => folderId => {
          return folderStoreMock.state.folders.filter(folder => folder.id === folderId)[0];
        }),
      },
    };

    projectStoreMock = {
      namespaced: true,
      state: { id: 300 },
    };

    store = new Vuex.Store({
      modules: {
        project: projectStoreMock,
        folder: folderStoreMock,
        note: noteStoreMock,
        error: new ErrorStoreMock().getMock(),
      },
    });

    const router = new VueRouter({
      routes,
    });
    router.push({
      name: 'Note',
      params: {
        projectId: projectStoreMock.state.id,
        folderId: folderStoreMock.state.folders[0].id,
        noteId: noteStoreMock.state.notes[0].id,
      },
    });

    vuetify = new Vuetify();
    wrapper = mount(Note, {
      propsData: {
        projectId: projectStoreMock.state.id,
        folderId: folderStoreMock.state.folders[0].id,
        noteId: noteStoreMock.state.notes[0].id,
      },
      store,
      localVue,
      router,
      vuetify,
      stubs: ['CustomEditor'],
      methods: {
        setHtmlToEditor() {
          jest.fn();
        },
        setEditorUnderSpaceHeight() {
          jest.fn();
        },
      },
    });
  });

  it('renders props.projectId when passed', async () => {
    // Props
    const projectId = 2;
    await wrapper.setProps({ projectId });

    expect(wrapper.props().projectId).toBe(projectId);
  });

  it('renders props.folderId when passed', async () => {
    // Props
    const folderId = 5;
    await wrapper.setProps({ folderId });

    expect(wrapper.props().folderId).toBe(folderId);
  });

  it('renders props.noteId when passed', async () => {
    // Props
    const noteId = 6;
    await wrapper.setProps({ noteId });

    expect(wrapper.props().noteId).toBe(noteId);
  });

  describe('beforeRouteEnter', () => {
    let $route;
    beforeEach(async () => {
      $route = {
        name: 'Note',
        params: { projectId: 3, folderId: 4 },
      };
    });

    it('初回遷移時、API接続にてノート情報を取得できた場合、dataに値を設定する', async () => {
      Note.beforeRouteEnter.call(wrapper.vm, undefined, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(noteStoreMock.actions.get).toHaveBeenCalled();

      const targetNote = noteStoreMock.state.notes[noteIdForGetAction];
      expect(wrapper.vm.note.title).toBe(targetNote.title);
      expect(wrapper.vm.note.text).toBe(targetNote.text);
      expect(wrapper.vm.note.htmltext).toBe(targetNote.htmltext);
    });

    it('初回遷移時、API接続にてエラーとなった場合、エラーステータスが403であれば、サインイン画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 403;
      Note.beforeRouteEnter($route, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('signin');
    });

    it('初回遷移時、API接続にてエラーとなった場合、エラーステータスが401,403以外であれば、AllNoteList画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 501;
      Note.beforeRouteEnter($route, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('AllNoteList');
    });
  });

  describe('beforeRouteUpdate', () => {
    let $routeBefore;
    let $routeAfter;
    beforeEach(async () => {
      $routeBefore = {
        name: 'Note',
        params: { projectId: 3, folderId: 4, noteId: 120 },
      };

      $routeAfter = {
        name: 'Note',
        params: { projectId: 3, folderId: 5, noteId: 210 },
      };
    });

    it('route更新時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
      const next = jest.fn();
      // thisをwrapperに指定する
      Note.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.get).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、遷移元と遷移先のnoteIdが同一の場合、API接続を実行せず、目的の画面に遷移する', async () => {
      $routeAfter.params.noteId = $routeBefore.params.noteId;
      const next = jest.fn();
      // thisをwrapperに指定する
      Note.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.get).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、API接続にてエラーとなった場合、AllNoteList画面に遷移しない', async () => {
      mockError = true;
      const next = jest.fn();
      Note.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.get).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('Note');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(folderStoreMock.state.folders[0].id);
      expect(wrapper.vm.$route.params.noteId).toBe(noteStoreMock.state.notes[0].id);
    });
  });

  describe('各項目の表示', () => {
    beforeEach(async () => {
      Note.beforeRouteEnter.call(wrapper.vm, undefined, undefined, c => c(wrapper.vm));
      await flushPromises();
    });

    it('storeのフォルダ名が表示されること', () => {
      expect(wrapper.text()).toMatch(folderStoreMock.state.folders[0].name);
    });

    it('storeのノートタイトルが表示されること', async () => {
      expect(wrapper.find('#title-note').element.value).toMatch(noteStoreMock.state.notes[0].title);
    });
  });

  describe('ノート設定', () => {
    beforeEach(async () => {
      // メニューを開く
      wrapper.find('#open-note-menu').trigger('click');
      await flushPromises();

      expect(wrapper.vm.isOpenMenu).toBeTruthy();
    });

    describe('ノートコピー', () => {
      it('ノートコピーボタンが押下された時、API処理を実行し、現在のルート画面遷移する', async () => {
        wrapper.vm.$router.push({ name: 'NoteInFolder' });
        wrapper.find('#copy-note').trigger('click');
        await flushPromises();

        expect(noteStoreMock.actions.copy).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('NoteInFolder');
        expect(wrapper.vm.$route.params.noteId).toBe(newNoteId);
      });

      it('ノート作成のAPIで失敗した時、画面遷移しない', async () => {
        mockError = true;
        wrapper.find('#copy-note').trigger('click');
        await flushPromises();

        expect(noteStoreMock.actions.copy).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('Note');
      });
    });

    describe('ノート削除', () => {
      it('ノート削除リストを押下すると、ノート削除確認ダイヤログを開く', async () => {
        expect(wrapper.find('.v-dialog--active').exists()).toBeFalsy();
        wrapper.find('#delete-note').trigger('click');
        await flushPromises();

        expect(wrapper.find('.v-dialog--active').exists()).toBeTruthy();
      });

      it('ノート削除が実行された時、delete処理を実行し、画面遷移する（現在のルートがNoteの場合）', async () => {
        wrapper.vm.deleteNote();
        await flushPromises();

        expect(noteStoreMock.actions.delete).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('AllNoteList');
      });

      it('ノート削除が実行された時、delete処理を実行し、画面遷移する（現在のルートがNoteInFolderの場合）', async () => {
        wrapper.vm.$router.push({ name: 'NoteInFolder' });
        wrapper.vm.deleteNote();
        await flushPromises();

        expect(noteStoreMock.actions.delete).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('NoteList');
      });

      it('ノート削除のAPIで失敗した時、画面遷移しない', async () => {
        mockError = true;
        wrapper.vm.deleteNote();
        await flushPromises();

        expect(noteStoreMock.actions.delete).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('Note');
      });
    });
  });

  describe('タイトル入力', () => {
    let input = '';
    beforeEach(async () => {
      Note.beforeRouteEnter.call(wrapper.vm, undefined, undefined, c => c(wrapper.vm));
      wrapper.setProps({
        projectId: projectStoreMock.state.id,
        folderId: folderStoreMock.state.folders[noteIdForGetAction].id,
        noteId: noteStoreMock.state.notes[noteIdForGetAction].id,
      });

      await flushPromises();

      input = wrapper.find('#title-note');
      expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();
    });

    it('入力すると、更新のAPI接続が実行される', async () => {
      const value = 'test-note-title-hoge';
      input.setValue(value);
      await flushPromises();

      // setTimeOutを即時実行させる
      jest.runAllTimers();

      expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();
      expect(noteStoreMock.actions.update).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.note.title).toBe(value);
    });

    it('一定時間内に複数回入力されたとき、更新のAPI接続が1回実行される', async () => {
      input.setValue('test-note-title-hoge');
      await flushPromises();
      input.setValue('test-note-title-hoge1');
      await flushPromises();

      // setTimeOutを即時実行させる
      jest.runAllTimers();

      expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();
      expect(noteStoreMock.actions.update).toHaveBeenCalledTimes(1);
    });

    it('入力後、API接続中にさらに入力されたとき、更新のAPI接続が2回実行される', async () => {
      input.setValue('test-note-title-hoge');
      await flushPromises();

      // API接続中を再現するために状態を設定する
      const { taskId } = wrapper.vm.runTaskStates[0];
      await wrapper.setData({
        runTaskStates: [{ noteId: noteStoreMock.state.notes[noteIdForGetAction].id, state: 'running', taskId }],
      });
      input.setValue('test-note-title-hoge');
      await flushPromises();

      // 待機しているsetTimeOutを実行させる
      jest.runOnlyPendingTimers();

      expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();
      expect(noteStoreMock.actions.update).toHaveBeenCalledTimes(2);
    });

    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue('t'.repeat(255 + 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      expect(noteStoreMock.actions.update).not.toHaveBeenCalled();
    });
  });

  describe('テキスト入力を', () => {
    let targetNote;
    beforeEach(async () => {
      targetNote = noteStoreMock.state.notes[noteIdForGetAction];

      Note.beforeRouteEnter.call(wrapper.vm, undefined, undefined, c => c(wrapper.vm));
      wrapper.setProps({
        projectId: projectStoreMock.state.id,
        folderId: folderStoreMock.state.folders[noteIdForGetAction].id,
        noteId: targetNote.id,
      });
      await flushPromises();

      expect(wrapper.find('.error--text').text()).toBeFalsy();

      await wrapper.setData({ isInitialized: false });
    });

    it('入力すると、更新のAPI接続が実行される', async () => {
      wrapper.vm.changeEditor(targetNote.htmltext, targetNote.text);
      await flushPromises();

      // // setTimeOutを即時実行させる
      jest.runAllTimers();

      expect(wrapper.find('.error--text').text()).toBeFalsy();
      expect(noteStoreMock.actions.update).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.note.htmltext).toBe(targetNote.htmltext);
      expect(wrapper.vm.note.text).toBe(targetNote.text);
    });

    it('一定時間内に複数回入力されたとき、更新のAPI接続が1回実行される', async () => {
      wrapper.vm.changeEditor(targetNote.htmltext, targetNote.text);
      await flushPromises();
      wrapper.vm.changeEditor(targetNote.htmltext, targetNote.text);
      await flushPromises();

      // setTimeOutを即時実行させる
      jest.runAllTimers();

      expect(wrapper.find('.error--text').text()).toBeFalsy();
      expect(noteStoreMock.actions.update).toHaveBeenCalledTimes(1);
    });

    it('入力後、API接続中にさらに入力されたとき、更新のAPI接続が2回実行される', async () => {
      wrapper.vm.changeEditor(targetNote.htmltext, targetNote.text);
      await flushPromises();

      // API接続中を再現するために状態を設定する
      const { taskId } = wrapper.vm.runTaskStates[0];
      await wrapper.setData({
        runTaskStates: [{ noteId: noteStoreMock.state.notes[noteIdForGetAction].id, state: 'running', taskId }],
      });
      wrapper.vm.changeEditor(targetNote.htmltext, targetNote.text);
      await flushPromises();

      // 待機しているsetTimeOutを実行させる
      jest.runOnlyPendingTimers();

      expect(wrapper.find('.error--text').text()).toBeFalsy();
      expect(noteStoreMock.actions.update).toHaveBeenCalledTimes(2);
    });

    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      wrapper.vm.changeEditor(targetNote.htmltext, 't'.repeat(32768 + 1));
      await flushPromises();

      expect(wrapper.find('.error--text').text()).toBeTruthy();
      expect(noteStoreMock.actions.update).not.toHaveBeenCalled();
    });
  });

  describe('画像設定', () => {
    const addImageBlob = async (file, callback) => {
      await wrapper.vm.addImageBlob(file, callback);
      // 内部で非同期処理が複数実行されるため、複数分実行する（苦肉の策）
      await flushPromises();
      await flushPromises();
    };
    it('画像アップロードに成功し、URLを取得する', async () => {
      const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
      let url = '';
      const callback = jest.fn().mockImplementation(imageUrl => {
        url = imageUrl;
      });

      await addImageBlob(file, callback);

      expect(noteStoreMock.actions.attachImage).toHaveBeenCalled();
      expect(wrapper.find('.error--text').text()).toBeFalsy();
      expect(url).toBe(newImageUrl);
    });

    it('画像アップロード サイズエラー', async () => {
      const maxSizeOverContent = 't'.repeat(8192 * 1024 + 1);
      const file = new File([maxSizeOverContent], 'example.png', { type: 'image/png' });
      let url = '';
      const callback = jest.fn().mockImplementation(imageUrl => {
        url = imageUrl;
      });

      await addImageBlob(file, callback);

      expect(noteStoreMock.actions.attachImage).not.toHaveBeenCalled();
      expect(wrapper.find('.error--text').text()).toBeTruthy();
      expect(url).toBe('');
    });

    it('画像アップロード 形式エラー', async () => {
      const file = new File(['dummy content'], 'example.text', { type: 'text/plain' });
      let url = '';
      const callback = jest.fn().mockImplementation(imageUrl => {
        url = imageUrl;
      });

      await addImageBlob(file, callback);

      expect(noteStoreMock.actions.attachImage).not.toHaveBeenCalled();
      expect(wrapper.find('.error--text').text()).toBeTruthy();
      expect(url).toBe('');
    });

    it('画像アップロード APIエラー', async () => {
      mockError = true;
      const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
      let url = '';
      const callback = jest.fn().mockImplementation(imageUrl => {
        url = imageUrl;
      });

      await addImageBlob(file, callback);

      expect(noteStoreMock.actions.attachImage).toHaveBeenCalled();
      expect(url).toBe('');
    });
  });
});
