import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import NoteList from '@/views/NoteList.vue';
import flushPromises from 'flush-promises';
import {
  sortItemUpdatedAt,
  sortItemCreatedAt,
  sortItemTitle,
  sortOrderValueDesc,
} from '@/mixins/inputInfo/note-sort-info';
import routes from '../modules/routes';
import { ErrorStoreMock, rejectError } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

// jest.mockはdescribeより先に定義しなければならない。
// jest.mockにて利用する変数はさらにその先に定義する。
// またjest.mockのスコープ外の変数を利用する場合は、変数名の先頭にmockをつける必要がある。
let mockError;
let mockErrorStatus;
let mockActionFn;
let mockFolderActions;

jest.mock('@/store', () => {
  const localVuex = require('vuex'); // eslint-disable-line global-require
  return new localVuex.Store({
    modules: {
      note: {
        namespaced: true,
        actions: {
          getNotesByfolderId: jest.fn().mockImplementation(() => {
            mockActionFn();
            if (!mockError) {
              return Promise.resolve({ notes: [] });
            }
            const error = { response: { status: mockErrorStatus } };
            return Promise.reject(error);
          }),
        },
      },
      folder: {
        namespaced: true,
        getters: {
          getFolderActionById: jest.fn().mockImplementation(() => folderId => {
            return mockFolderActions.filter(folder => folder.id === folderId)[0];
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
    mockFolderActions = [];

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
          task: { id: 1, date_to: new Date('2022/10/1'), completed: false },
        },
        {
          id: 11,
          folder_id: 1,
          title: 'note-title11',
          text: 'note-text11',
          htmltext: '<div>note-text11</div>',
          created_at: new Date('2021/1/11 2:3:4'),
          updated_at: new Date('2021/1/12 5:6:7'),
          task: { id: 2, date_to: new Date('2022/10/2'), completed: true },
        },
        {
          id: 20,
          folder_id: 2,
          title: 'note-title2',
          text: 'note-text2',
          htmltext: '<div>note-text2</div>',
          created_at: new Date('2021/2/1 11:12:13'),
          updated_at: new Date('2021/2/2 12:13:14'),
          task: { id: 3, date_to: new Date('2022/10/3'), completed: false },
        },
        {
          id: 21,
          folder_id: 2,
          title: 'note-title22',
          text: 'note-text22',
          htmltext: '<div>note-text22</div>',
          created_at: new Date('2021/2/11 21:22:23'),
          updated_at: new Date('2021/2/12 22:23:24'),
          task: { id: 4, date_to: new Date('2022/10/4'), completed: true },
        },
      ],
    };

    // Vuexストアのモックを作成する
    noteStoreMock = {
      namespaced: true,
      state: stateNote,
      getters: {
        getNotesByfolderId: jest.fn().mockImplementation(() => folderId => {
          return stateNote.notes.filter(note => note.folder_id === folderId);
        }),
      },
      actions: {
        getNotesByfolderId: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve(['success']);
          }
          return rejectError(wrapper);
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
        foldersAction: mockFolderActions,
      },
      getters: {
        getFolderById: jest.fn().mockImplementation(() => folderId => {
          return folderStoreMock.state.folders.filter(folder => folder.id === folderId)[0];
        }),
        getFolderActionById: jest.fn().mockImplementation(() => folderId => {
          return folderStoreMock.state.foldersAction.filter(folder => folder.id === folderId)[0];
        }),
      },
      mutations: {
        setFolderAction: jest.fn().mockImplementation(() => {
          mockActionSample(wrapper, mockError);
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
      mode: 'abstract',
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

  it('renders props.searchQuery when passed', async () => {
    // Props
    const searchQuery = 'test';
    await wrapper.setProps({ searchQuery });

    expect(wrapper.props().searchQuery).toBe(searchQuery);
  });

  describe('beforeRouteEnter', () => {
    let $route;
    const searchQuery = 'test';
    beforeEach(async () => {
      $route = {
        name: 'NoteList',
        params: { projectId: 3, folderId: 4 },
        query: { search: searchQuery },
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
    let next;
    beforeEach(async () => {
      $routeBefore = {
        name: 'NoteList',
        params: { projectId: 3, folderId: 4 },
        query: { search: 'test' },
      };

      $routeAfter = {
        name: 'NoteList',
        params: { projectId: 3, folderId: 5 },
        query: { search: 'test' },
      };

      next = jest.fn();
    });

    it('route更新時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
      // thisをwrapperに指定する
      NoteList.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、遷移元と遷移先のfolderIdが同一、かつqueryも同一の場合、API接続を実行せず、目的の画面に遷移する', async () => {
      $routeAfter.params.folderId = $routeBefore.params.folderId;

      // thisをwrapperに指定する
      NoteList.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByfolderId).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、遷移元と遷移先のfolderIdが同一、かつqueryが同一ではない場合、API接続を実行し、目的の画面に遷移する', async () => {
      $routeAfter.params.folderId = $routeBefore.params.folderId;
      $routeAfter.query.search = 'test-routeafter';

      // thisをwrapperに指定する
      NoteList.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、API接続にてエラーとなった場合、AllNoteList画面に遷移しない', async () => {
      mockError = true;

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

    describe('タスク情報の表示', () => {
      it('storeのtask.completed = false の場合、task.date_toが表示されること', () => {
        expect(wrapper.text()).toMatch('2022/10/01(土)');
      });

      it('storeのtask.completed = true の場合、task.date_toが表示されないこと', () => {
        expect(wrapper.text()).not.toMatch('2022/10/02(日)');
      });

      it('task.completed が true => falseになった時、task.date_toが表示されること', async () => {
        wrapper.vm.$store.state.note.notes[1].task.completed = false;
        await flushPromises();
        expect(wrapper.text()).toMatch('2022/10/02(日)');
      });

      it('task.completed が false => trueになった時、task.date_toが表示されないこと', async () => {
        wrapper.vm.$store.state.note.notes[0].task.completed = true;
        await flushPromises();
        expect(wrapper.text()).not.toMatch('2022/10/01(土)');
      });

      it('task.date_to を変更した場合、反映されること', async () => {
        wrapper.vm.$store.state.note.notes[0].task.date_to = new Date('2022/11/1');
        await flushPromises();
        expect(wrapper.text()).toMatch('2022/11/01(火)');
      });
    });

    describe('ソート順', () => {
      it('デフォルトのソート項目と昇順降順アイコンが表示されること', () => {
        expect(wrapper.find('#sort-note-list').text()).toBe(`${sortItemUpdatedAt.label}順`);
        expect(wrapper.find('#sort-icon-down').exists()).toBeFalsy();
        expect(wrapper.find('#sort-icon-up').exists()).toBeTruthy();
      });

      it('前回実行したソート順が存在する場合、ソート項目と昇順降順アイコンに前回の値が表示されること', async () => {
        await mockFolderActions.push({ id: 1, sortItem: sortItemCreatedAt.value, sortOrder: sortOrderValueDesc });

        expect(wrapper.find('#sort-note-list').text()).toBe(`${sortItemCreatedAt.label}順`);
        expect(wrapper.find('#sort-icon-down').exists()).toBeFalsy();
        expect(wrapper.find('#sort-icon-up').exists()).toBeTruthy();
      });

      it('ソート処理を実行すると、ノート取得のAPI呼び出し処理と、前回のソート記録処理が呼ばれること', async () => {
        wrapper.vm.sortNotes(sortItemCreatedAt.value, sortOrderValueDesc.value);
        await flushPromises();

        expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
        expect(folderStoreMock.mutations.setFolderAction).toHaveBeenCalled();
      });

      it('ソート処理を実行すると、ノート取得のAPI呼び出し処理に失敗した場合、前回のソート記録処理が呼ばれないこと', async () => {
        mockError = true;

        wrapper.vm.sortNotes(sortItemCreatedAt.value, sortOrderValueDesc.value);
        await flushPromises();

        expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
        expect(folderStoreMock.mutations.setFolderAction).not.toHaveBeenCalled();
      });

      it('ソート項目が作成日時順の場合、リストに表示されるリストがupdated_atからcreated_atに変わること', async () => {
        await mockFolderActions.push({ id: 1, sortItem: sortItemCreatedAt.value, sortOrder: sortOrderValueDesc });

        expect(wrapper.text()).toMatch('2021/01/01(金) 1:02');
        expect(wrapper.text()).toMatch('2021/01/11(月) 2:03');
      });

      it('ソート項目が更新日時順でも作成日時順でもない場合、リストに表示されるリストがupdated_atになること', async () => {
        await mockFolderActions.push({ id: 1, sortItem: sortItemTitle.value, sortOrder: sortOrderValueDesc });

        expect(wrapper.text()).toMatch('2021/01/02(土) 4:05');
        expect(wrapper.text()).toMatch('2021/01/12(火) 5:06');
      });
    });

    describe('フォルダの切り替え', () => {
      beforeEach(async () => {
        await wrapper.setProps({ folderId: folderStoreMock.state.folders[1].id });
        await mockFolderActions.push({ id: 1, sortItem: sortItemCreatedAt.value, sortOrder: sortOrderValueDesc });
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

      describe('タスク情報の表示', () => {
        it('storeのtask.completed = false の場合、task.date_toが表示されること', () => {
          expect(wrapper.text()).toMatch('2022/10/03(月)');
        });

        it('storeのtask.completed = true の場合、task.date_toが表示されないこと', () => {
          expect(wrapper.text()).not.toMatch('2022/10/04(火)');
        });

        it('task.completed が true => falseになった時、task.date_toが表示されること', async () => {
          wrapper.vm.$store.state.note.notes[3].task.completed = false;
          await flushPromises();
          expect(wrapper.text()).toMatch('2022/10/04(火)');
        });

        it('task.completed が false => trueになった時、task.date_toが表示されないこと', async () => {
          wrapper.vm.$store.state.note.notes[2].task.completed = true;
          await flushPromises();
          expect(wrapper.text()).not.toMatch('2022/10/03(月)');
        });

        it('task.date_to を変更した場合、反映されること', async () => {
          wrapper.vm.$store.state.note.notes[2].task.date_to = new Date('2022/11/1');
          await flushPromises();
          expect(wrapper.text()).toMatch('2022/11/01(火)');
        });
      });

      describe('ソート順', () => {
        it('デフォルトのソート項目と昇順降順アイコンが表示されること', () => {
          expect(wrapper.find('#sort-note-list').text()).toBe(`${sortItemUpdatedAt.label}順`);
          expect(wrapper.find('#sort-icon-down').exists()).toBeFalsy();
          expect(wrapper.find('#sort-icon-up').exists()).toBeTruthy();
        });

        it('前回実行したソート順が存在する場合、ソート項目と昇順降順アイコンに前回の値が表示されること', async () => {
          await mockFolderActions.push({ id: 2, sortItem: sortItemTitle.value, sortOrder: sortOrderValueDesc });

          expect(wrapper.find('#sort-note-list').text()).toBe(`${sortItemTitle.label}順`);
          expect(wrapper.find('#sort-icon-down').exists()).toBeFalsy();
          expect(wrapper.find('#sort-icon-up').exists()).toBeTruthy();
        });

        it('ソート項目が作成日時順の場合、リストに表示されるリストがupdated_atからcreated_atに変わること', async () => {
          await mockFolderActions.push({ id: 2, sortItem: sortItemCreatedAt.value, sortOrder: sortOrderValueDesc });

          expect(wrapper.text()).toMatch('2021/02/01(月) 11:12');
          expect(wrapper.text()).toMatch('2021/02/11(木) 21:22');
        });

        it('ソート項目が更新日時順でも作成日時順でもない場合、リストに表示されるリストがupdated_atになること', async () => {
          await mockFolderActions.push({ id: 2, sortItem: sortItemTitle.value, sortOrder: sortOrderValueDesc });

          expect(wrapper.text()).toMatch('2021/02/02(火) 12:13');
          expect(wrapper.text()).toMatch('2021/02/12(金) 22:23');
        });
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

      it('フォルダ削除が実行された時、delete処理を実行し、画面遷移する(with query.search)', async () => {
        const searchQuery = 'test';
        await wrapper.setProps({ searchQuery });

        wrapper.vm.deleteFolder();
        await flushPromises();

        expect(folderStoreMock.actions.delete).toHaveBeenCalled();
        expect(wrapper.vm.$route.name).toBe('AllNoteList');
        expect(wrapper.vm.$route.query.search).toBe(searchQuery);
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

    it('ノート作成ボタンが押下された時、API処理を実行し、画面遷移する(with query.search)', async () => {
      const searchQuery = 'test';
      await wrapper.setProps({ searchQuery });

      wrapper.find('#create-note-notelist').trigger('click');
      await flushPromises();

      expect(noteStoreMock.actions.create).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('NoteInFolder');
      expect(wrapper.vm.$route.params.noteId).toBe(newNoteId);
      expect(wrapper.vm.$route.query.search).toBe(searchQuery);
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

    it('ノートのリストを押下すると、クエリ文字列が設定されていた場合、クエリ文字列を引き継いでNote画面に遷移すること', async () => {
      const searchQuery = 'test';
      await wrapper.vm.$router.push({ query: { search: searchQuery } });

      const target = noteStoreMock.state.notes[1];
      wrapper.find(`a[href*='notelist/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('NoteInFolder');
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
      expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
    });

    it('スクロール位置が最下部に移動すると、API接続し、失敗すると内部のページングカウントを増やさない', async () => {
      mockError = true;
      expect(wrapper.vm.page).toBe(1);

      // スクロール位置とスクロール幅の合計値がスクロール全体の高さと等しくなった場合、最下部と判定される
      // デフォルトではelementのscrollTopやscrollHeightは0のため、スクロール位置が一番下である状態と等しい。
      wrapper.find('.v-list').trigger('scroll');
      await flushPromises();

      expect(wrapper.vm.page).toBe(1);
      expect(noteStoreMock.actions.getNotesByfolderId).toHaveBeenCalled();
    });

    it('スクロール位置が最下部ではない場合、API接続しない', async () => {
      // scrollHeightの値を増やせば、スクロールは最下部と判定されなくなる。
      Object.defineProperty(wrapper.find('.v-list').element, 'scrollHeight', {
        value: 100,
      });

      wrapper.find('.v-list').trigger('scroll');
      await flushPromises();

      expect(noteStoreMock.actions.getNotesByfolderId).not.toHaveBeenCalled();
    });
  });
});
