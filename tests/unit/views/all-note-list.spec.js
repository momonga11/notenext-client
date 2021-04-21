import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import AllNoteList from '@/views/AllNoteList.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock, rejectError } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

// jest.mockはdescribeより先に定義しなければならない。
// jest.mockにて利用する変数はさらにその先に定義する。
// またjest.mockのスコープ外の変数を利用する場合は、変数名の先頭にmockをつける必要がある。
let mockError;
let mockActionFn;
let mockGetFoldersExistsNote;
let mockGetFolders;
let mockErrorFolderAction;

jest.mock('@/store', () => {
  const localVuex = require('vuex'); // eslint-disable-line global-require
  return new localVuex.Store({
    modules: {
      note: {
        namespaced: true,
        actions: {
          getNotesByProjectId: jest.fn().mockImplementation(() => {
            mockActionFn();
            if (!mockError) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('fail'));
          }),
        },
      },
      folder: {
        namespaced: true,
        actions: {
          getFoldersExistsNote: jest.fn().mockImplementation(() => {
            mockGetFoldersExistsNote();
            if (!mockErrorFolderAction) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('fail'));
          }),
          getFolders: jest.fn().mockImplementation(() => {
            mockGetFolders();
            if (!mockErrorFolderAction) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('fail'));
          }),
        },
      },
    },
  });
});

describe('AllNoteList.vue', () => {
  let wrapper;
  let store;
  let projectStoreMock;
  let noteStoreMock;
  let folderStoreMock;
  let vuetify;
  let noteProjectId;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;
    mockErrorFolderAction = false;
    noteProjectId = 300;
    mockActionFn = jest.fn();
    mockGetFoldersExistsNote = jest.fn();
    mockGetFolders = jest.fn();

    const stateNote = {
      notes: [
        {
          id: 10,
          project_id: noteProjectId,
          folder_id: 1,
          title: 'note-title1',
          text: 'note-text1',
          htmltext: '<div>note-text1</div>',
          created_at: new Date('2021/1/1 1:2:3'),
          updated_at: new Date('2021/1/2 4:5:6'),
        },
        {
          id: 11,
          project_id: noteProjectId,
          folder_id: 1,
          title: 'note-title11',
          text: 'note-text11',
          htmltext: '<div>note-text11</div>',
          created_at: new Date('2021/1/11 2:3:4'),
          updated_at: new Date('2021/1/12 5:6:7'),
        },
        {
          id: 20,
          project_id: noteProjectId,
          folder_id: 2,
          title: 'note-title2',
          text: 'note-text2',
          htmltext: '<div>note-text2</div>',
          created_at: new Date('2021/2/1 11:12:13'),
          updated_at: new Date('2021/2/2 12:13:14'),
        },
        {
          id: 21,
          project_id: noteProjectId,
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
        getNotesByProjectId: jest.fn().mockImplementation(() => projectId => {
          return stateNote.notes.filter(note => note.project_id === projectId);
        }),
      },
      actions: {
        getNotesByProjectId: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve(['success']);
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
        getFolderById: jest.fn().mockImplementation(() => folderId => {
          return folderStoreMock.state.folders.filter(folder => folder.id === folderId)[0];
        }),
      },
      actions: {
        getFoldersExistsNote: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockErrorFolderAction);
        }),
        getFolders: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockErrorFolderAction);
        }),
      },
    };

    projectStoreMock = {
      namespaced: true,
      state: { id: noteProjectId },
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
      mode: 'abstract',
    });

    router.push({
      name: 'AllNoteList',
      params: { projectId: projectStoreMock.state.id },
    });

    vuetify = new Vuetify();
    wrapper = mount(AllNoteList, {
      propsData: { projectId: projectStoreMock.state.id },
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

  it('renders props.searchQuery when passed', async () => {
    // Props
    const searchQuery = 'test';
    await wrapper.setProps({ searchQuery });

    expect(wrapper.props().searchQuery).toBe(searchQuery);
  });

  describe('beforeRouteEnter', () => {
    let $route;
    let next;

    beforeEach(() => {
      next = jest.fn();
    });

    describe('not search query', () => {
      beforeEach(async () => {
        $route = {
          name: 'AllNoteList',
          params: { projectId: 3 },
          query: { search: '' },
        };
      });

      it('初回遷移時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
        AllNoteList.beforeRouteEnter($route, undefined, next);
        await flushPromises();

        expect(mockActionFn).toHaveBeenCalled();
        expect(mockGetFolders).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
      });

      it('初回遷移時、ノート取得のためのAPI接続にてエラーとなった場合、サインイン画面に遷移する', async () => {
        mockError = true;
        let nextRoute = '';
        next = jest.fn().mockImplementation(route => {
          nextRoute = route;
        });
        AllNoteList.beforeRouteEnter($route, undefined, next);
        await flushPromises();

        expect(mockActionFn).toHaveBeenCalled();
        expect(nextRoute.name).toBe('signin');
      });

      it('初回遷移時、フォルダ取得のためのAPI接続にてエラーとなった場合、サインイン画面に遷移する', async () => {
        mockErrorFolderAction = true;
        let nextRoute = '';
        next = jest.fn().mockImplementation(route => {
          nextRoute = route;
        });
        AllNoteList.beforeRouteEnter($route, undefined, next);
        await flushPromises();

        expect(mockGetFolders).toHaveBeenCalled();
        expect(nextRoute.name).toBe('signin');
      });
    });

    describe('with search query', () => {
      beforeEach(async () => {
        $route = {
          name: 'AllNoteList',
          params: { projectId: 3 },
          query: { search: 'test' },
        };
      });

      it('HaveBeenCallded getFoldersExistsNote', async () => {
        AllNoteList.beforeRouteEnter($route, undefined, next);
        await flushPromises();

        expect(mockActionFn).toHaveBeenCalled();
        expect(mockGetFoldersExistsNote).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
      });

      it('初回遷移時、フォルダ取得のためのAPI接続にてエラーとなった場合、サインイン画面に遷移する', async () => {
        mockErrorFolderAction = true;
        let nextRoute = '';
        next = jest.fn().mockImplementation(route => {
          nextRoute = route;
        });
        AllNoteList.beforeRouteEnter($route, undefined, next);
        await flushPromises();

        expect(mockGetFoldersExistsNote).toHaveBeenCalled();
        expect(nextRoute.name).toBe('signin');
      });
    });
  });

  describe('beforeRouteUpdate', () => {
    let $routeBefore;
    let $routeAfter;
    let next;

    describe('not search query', () => {
      const setRoute = name => {
        return {
          name,
          params: { projectId: 3 },
          query: { search: '' },
        };
      };

      beforeEach(async () => {
        // routeのtoとfromのnameが異なる場合（API接続あり）
        $routeBefore = setRoute('NoteList');
        $routeAfter = setRoute('AllNoteList');
        next = jest.fn();
      });

      it('route更新時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
        AllNoteList.beforeRouteUpdate.call(wrapper.vm, $routeAfter, $routeBefore, next);
        await flushPromises();

        expect(noteStoreMock.actions.getNotesByProjectId).toHaveBeenCalled();
        expect(folderStoreMock.actions.getFolders).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
      });

      describe('APIエラー', () => {
        beforeEach(() => {
          wrapper.vm.$router.push({ name: 'NoteList' });
        });

        it('route更新時、ノート取得のAPI接続にてエラーとなった場合、afterに遷移しない', async () => {
          mockError = true;
          AllNoteList.beforeRouteUpdate.call(wrapper.vm, $routeAfter, $routeBefore, next);
          await flushPromises();

          expect(next).toHaveBeenCalled();
          expect(wrapper.vm.$route.name).toBe('NoteList');
        });

        it('route更新時、フォルダ取得のAPI接続にてエラーとなった場合、afterに遷移しない', async () => {
          mockErrorFolderAction = true;
          AllNoteList.beforeRouteUpdate.call(wrapper.vm, $routeAfter, $routeBefore, next);
          await flushPromises();

          expect(next).toHaveBeenCalled();
          expect(wrapper.vm.$route.name).toBe('NoteList');
        });
      });

      it('route更新時、AllNoteListから異なるroute:nameに遷移した場合、API接続を実行せず、目的の画面に遷移する', async () => {
        $routeBefore = setRoute('AllNoteList');
        $routeAfter = setRoute('Note');

        AllNoteList.beforeRouteUpdate.call(wrapper.vm, $routeAfter, $routeBefore, next);
        await flushPromises();

        expect(noteStoreMock.actions.getNotesByProjectId).not.toHaveBeenCalled();
        expect(folderStoreMock.actions.getFolders).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
      });

      it('route更新時、route:nameとroute:queryが同一の場合、API接続を実行せず、目的の画面に遷移する', async () => {
        $routeBefore = setRoute('AllNoteList');
        $routeAfter = setRoute('AllNoteList');

        AllNoteList.beforeRouteUpdate.call(wrapper.vm, $routeAfter, $routeBefore, next);
        await flushPromises();

        expect(noteStoreMock.actions.getNotesByProjectId).not.toHaveBeenCalled();
        expect(folderStoreMock.actions.getFolders).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
      });
    });

    describe('with search query', () => {
      const setRoute = name => {
        return {
          name,
          params: { projectId: 3 },
          query: { search: 'test' },
        };
      };

      beforeEach(async () => {
        // routeのtoとfromのnameが異なる場合（API接続あり）
        $routeBefore = setRoute('NoteList');
        $routeAfter = setRoute('AllNoteList');
        next = jest.fn();
      });

      it('HaveBeenCallded getFoldersExistsNote', async () => {
        AllNoteList.beforeRouteUpdate.call(wrapper.vm, $routeAfter, $routeBefore, next);
        await flushPromises();

        expect(folderStoreMock.actions.getFoldersExistsNote).toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
      });

      describe('APIエラー', () => {
        beforeEach(() => {
          wrapper.vm.$router.push({ name: 'NoteList' });
        });

        it('route更新時、フォルダ取得のAPI接続にてエラーとなった場合、afterに遷移しない', async () => {
          mockErrorFolderAction = true;
          AllNoteList.beforeRouteUpdate.call(wrapper.vm, $routeAfter, $routeBefore, next);
          await flushPromises();

          expect(next).toHaveBeenCalled();
          expect(folderStoreMock.actions.getFoldersExistsNote).toHaveBeenCalled();
          expect(wrapper.vm.$route.name).toBe('NoteList');
        });
      });
    });
  });

  describe('各項目の表示', () => {
    it('storeのフォルダ名が全件表示されること', () => {
      expect(wrapper.text()).toMatch(folderStoreMock.state.folders[0].name);
      expect(wrapper.text()).toMatch(folderStoreMock.state.folders[1].name);
    });

    it('storeのノートタイトルが全件表示されること', () => {
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[0].title);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[1].title);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[2].title);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[3].title);
    });

    it('storeのノートテキストが全件表示されること', () => {
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[0].text);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[1].text);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[2].text);
      expect(wrapper.text()).toMatch(noteStoreMock.state.notes[3].text);
    });

    it('storeのupdated_atが全件変換されて表示されること', () => {
      expect(wrapper.text()).toMatch('2021/01/02(土) 4:05');
      expect(wrapper.text()).toMatch('2021/01/12(火) 5:06');
      expect(wrapper.text()).toMatch('2021/02/02(火) 12:13');
      expect(wrapper.text()).toMatch('2021/02/12(金) 22:23');
    });
  });

  it('ルートがAllNoteListの場合、ノート選択コンポーネントを表示する', async () => {
    expect(wrapper.vm.$route.name).toBe('AllNoteList');
    expect(wrapper.find('#noselectnote-all').element.style.display).toBe('');
  });

  it('ルートがNoteInFolderの場合、ノート選択コンポーネントを表示しない', async () => {
    const target = noteStoreMock.state.notes[0];
    wrapper.find(`a[href*='notelist/${target.id}']`).trigger('click');
    await flushPromises();

    expect(wrapper.vm.$route.name).toBe('Note');
    expect(wrapper.find('#noselectnote-all').element.style.display).toBe('none');
  });

  describe('ノートリスト（複数分）押下', () => {
    it('ノート1のリストを押下すると、Note画面に遷移すること', async () => {
      const target = noteStoreMock.state.notes[0];
      wrapper.find(`a[href*='notelist/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('Note');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(target.folder_id);
      expect(wrapper.vm.$route.params.noteId).toBe(target.id);
    });

    it('ノート2のリストを押下すると、Note画面に遷移すること', async () => {
      const target = noteStoreMock.state.notes[1];
      wrapper.find(`a[href*='notelist/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('Note');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(target.folder_id);
      expect(wrapper.vm.$route.params.noteId).toBe(target.id);
    });

    it('ノートのリストを押下すると、クエリ文字列が設定されていた場合、クエリ文字列を引き継いでNote画面に遷移すること', async () => {
      const searchQuery = 'test';
      await wrapper.vm.$router.push({ query: { search: 'test' } });

      const target = noteStoreMock.state.notes[1];
      wrapper.find(`a[href*='notelist/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('Note');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(target.folder_id);
      expect(wrapper.vm.$route.params.noteId).toBe(target.id);
      expect(wrapper.vm.$route.query.search).toBe(searchQuery);
    });
  });

  describe('無限スクロール', () => {
    it('スクロール位置が最下部に移動すると、API接続し、成功すると内部のページングカウントを増やす', async () => {
      expect(wrapper.vm.page).toBe(1);

      // スクロール位置とスクロール幅の合計値がスクロール全体の高さと等しくなった場合、最下部と判定される
      // デフォルトではelementのscrollTopやscrollHeightは0のため、スクロール位置が一番下である状態と等しい。
      wrapper.find('.v-list').trigger('scroll');
      await flushPromises();

      expect(wrapper.vm.page).toBe(2);
      expect(noteStoreMock.actions.getNotesByProjectId).toHaveBeenCalled();
    });

    it('スクロール位置が最下部に移動すると、API接続し、失敗すると内部のページングカウントを増やさない', async () => {
      mockError = true;
      expect(wrapper.vm.page).toBe(1);

      // スクロール位置とスクロール幅の合計値がスクロール全体の高さと等しくなった場合、最下部と判定される
      // デフォルトではelementのscrollTopやscrollHeightは0のため、スクロール位置が一番下である状態と等しい。
      wrapper.find('.v-list').trigger('scroll');
      await flushPromises();

      expect(wrapper.vm.page).toBe(1);
      expect(noteStoreMock.actions.getNotesByProjectId).toHaveBeenCalled();
    });

    it('スクロール位置が最下部ではない場合、API接続しない', async () => {
      // scrollHeightの値を増やせば、スクロールは最下部と判定されなくなる。
      Object.defineProperty(wrapper.find('.v-list').element, 'scrollHeight', {
        value: 100,
      });

      wrapper.find('.v-list').trigger('scroll');
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByProjectId).not.toHaveBeenCalled();
    });
  });
});
