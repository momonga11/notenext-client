import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import NoteList from '@/views/NoteList.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock, rejectError } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

// jest.mockはdescribeより先に定義しなければならない。
// jest.mockにて利用する変数はさらにその先に定義する。
// またjest.mockのスコープ外の変数を利用する場合は、変数名の先頭にmockをつける必要がある。
let mockError;
let mockErrorStatus;
let mockActionFn;

jest.mock('@/store', () => {
  const _vuex = require('vuex');
  return new _vuex.Store({
    modules: {
      note: {
        namespaced: true,
        actions: {
          getNotesByfolderId: jest.fn().mockImplementation(() => {
            mockActionFn();
            if (!mockError) {
              return Promise.resolve();
            }
            const error = { response: { status: mockErrorStatus } };
            return Promise.reject(error);
          }),
        },
      },
    },
  });
});

describe('NoteList.vue', () => {
  let wrapper;
  let store;
  let projectStoreMock;
  let noteStoreMock;
  let folderStoreMock;
  let vuetify;
  let newNoteId;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;
    mockErrorStatus = 403;
    newNoteId = 100;
    mockActionFn = jest.fn();

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
        getNotesByfolderId: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        create: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve({ id: newNoteId });
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
      actions: {
        delete: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        get: jest.fn().mockImplementation(() => {
          return Promise.resolve({
            id: 1,
            name: 'test-folder-name',
            description: 'test-folder-description',
          });
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
      name: 'NoteList',
      params: { projectId: projectStoreMock.state.id, folderId: folderStoreMock.state.folders[0].id },
    });

    vuetify = new Vuetify();
    wrapper = mount(NoteList, {
      propsData: { projectId: projectStoreMock.state.id, folderId: folderStoreMock.state.folders[0].id },
      store,
      localVue,
      router,
      vuetify,
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

  describe('beforeRouteEnter', () => {
    let $route;
    beforeEach(async () => {
      $route = {
        name: 'NoteList',
        params: { projectId: 3, folderId: 4 },
      };
    });

    it('初回遷移時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
      const next = jest.fn();
      NoteList.beforeRouteEnter($route, undefined, next);
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('初回遷移時、API接続にてエラーとなった場合、エラーステータスが403であれば、サインイン画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 403;
      NoteList.beforeRouteEnter($route, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('signin');
    });

    it('初回遷移時、API接続にてエラーとなった場合、エラーステータスが401,403以外であれば、AllNoteList画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 501;
      NoteList.beforeRouteEnter($route, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('AllNoteList');
    });
  });

  describe('beforeRouteUpdate', () => {
    let $routeBefore;
    let $routeAfter;
    beforeEach(async () => {
      $routeBefore = {
        name: 'NoteList',
        params: { projectId: 3, folderId: 4 },
      };

      $routeAfter = {
        name: 'NoteList',
        params: { projectId: 3, folderId: 5 },
      };
    });

    it('route更新時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
      const next = jest.fn();
      // thisをwrapperに指定する
      NoteList.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、遷移元と遷移先のfolderIdが同一の場合、API接続を実行せず、目的の画面に遷移する', async () => {
      $routeAfter.params.folderId = $routeBefore.params.folderId;
      const next = jest.fn();
      // thisをwrapperに指定する
      NoteList.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByfolderId).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、API接続にてエラーとなった場合、AllNoteList画面に遷移しない', async () => {
      mockError = true;
      const next = jest.fn();
      NoteList.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('NoteList');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(folderStoreMock.state.folders[0].id);
    });
  });

  describe('各項目の表示', () => {
    it('storeのフォルダ名が表示されること', () => {
      expect(wrapper.text()).toMatch(folderStoreMock.state.folders[0].name);
    });

    it('storeのノートタイトルが全件表示されること', () => {
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[0].title);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[1].title);
    });

    it('storeのノートテキストが全件表示されること', () => {
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[0].text);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[1].text);
    });

    it('storeのupdated_atが全件変換されて表示されること', () => {
      expect(wrapper.text()).toMatch('2021/01/02(土) 4:05');
      expect(wrapper.text()).toMatch('2021/01/12(火) 5:06');
    });

    describe('フォルダの切り替え', () => {
      beforeEach(async () => {
        await wrapper.setProps({ folderId: folderStoreMock.state.folders[1].id });
      });

      it('storeのフォルダ名が表示されること', () => {
        expect(wrapper.text()).toMatch(folderStoreMock.state.folders[1].name);
      });

      it('storeのノートタイトルが全件表示されること', () => {
        expect(wrapper.text()).toMatch(noteStoreMock.state.notes[2].title);
        expect(wrapper.text()).toMatch(noteStoreMock.state.notes[3].title);
      });

      it('storeのノートテキストが全件表示されること', () => {
        expect(wrapper.text()).toMatch(noteStoreMock.state.notes[2].text);
        expect(wrapper.text()).toMatch(noteStoreMock.state.notes[3].text);
      });

      it('storeのupdated_atが全件変換されて表示されること', () => {
        expect(wrapper.text()).toMatch('2021/02/02(火) 12:13');
        expect(wrapper.text()).toMatch('2021/02/12(金) 22:23');
      });
    });
  });

  describe('フォルダ設定', () => {
    beforeEach(async () => {
      // メニューを開く
      wrapper.find('#folder-setting-notelist').trigger('click');
      await flushPromises();

      expect(wrapper.vm.menuValue).toBeTruthy();
    });

    it('フォルダ設定リストを押下すると、フォルダ設定ダイヤログを開く', async () => {
      expect(wrapper.find('.v-dialog--active').exists()).toBeFalsy();
      wrapper.find('#open-folder-update-dialog-notelist').trigger('click');
      await flushPromises();

      expect(wrapper.find('.v-dialog--active').exists()).toBeTruthy();
    });

    describe('フォルダ削除', () => {
      it('フォルダ削除リストを押下すると、フォルダ削除確認ダイヤログを開く', async () => {
        expect(wrapper.find('.v-dialog--active').exists()).toBeFalsy();
        wrapper.find('#open-folder-delete-dialog-notelist').trigger('click');
        await flushPromises();

        expect(wrapper.find('.v-dialog--active').exists()).toBeTruthy();
      });

      it('フォルダ削除が実行された時、delete処理を実行し、画面遷移する', async () => {
        wrapper.vm.deleteFolder();
        await flushPromises();

        expect(folderStoreMock.actions.delete).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('AllNoteList');
      });

      it('フォルダ削除のAPIで失敗した時、画面遷移しない', async () => {
        mockError = true;
        wrapper.vm.deleteFolder();
        await flushPromises();

        expect(folderStoreMock.actions.delete).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('NoteList');
      });
    });
  });

  describe('ノート作成', () => {
    it('ノート作成ボタンが押下された時、API処理を実行し、画面遷移する', async () => {
      wrapper.find('#create-note-notelist').trigger('click');
      await flushPromises();

      expect(noteStoreMock.actions.create).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('NoteInFolder');
      expect(wrapper.vm.$route.params.noteId).toBe(newNoteId);
    });

    it('ノート作成のAPIで失敗した時、画面遷移しない', async () => {
      mockError = true;
      wrapper.find('#create-note-notelist').trigger('click');
      await flushPromises();

      expect(noteStoreMock.actions.create).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('NoteList');
    });
  });

  it('ルートがNoteListの場合、ノート選択コンポーネントを表示する', async () => {
    expect(wrapper.vm.$route.name).toBe('NoteList');
    expect(wrapper.find('#noselectnote').element.style.display).toBe('');
  });

  it('ルートがNoteInFolderの場合、ノート選択コンポーネントを表示しない', async () => {
    wrapper.find('#create-note-notelist').trigger('click');
    await flushPromises();

    expect(wrapper.vm.$route.name).toBe('NoteInFolder');
    expect(wrapper.find('#noselectnote').element.style.display).toBe('none');
  });

  describe('ノートリスト押下（複数分）', () => {
    it('ノート1のリストを押下すると、NoteInFolder画面に遷移すること', async () => {
      const target = noteStoreMock.state.notes[0];
      wrapper.find(`a[href*='notelist/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('NoteInFolder');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(target.folder_id);
      expect(wrapper.vm.$route.params.noteId).toBe(target.id);
    });

    it('ノート2のリストを押下すると、NoteInFolder画面に遷移すること', async () => {
      const target = noteStoreMock.state.notes[1];
      wrapper.find(`a[href*='notelist/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('NoteInFolder');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(target.folder_id);
      expect(wrapper.vm.$route.params.noteId).toBe(target.id);
    });
  });
});
