import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import AllNoteList from '@/views/AllNoteList.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

// jest.mockはdescribeより先に定義しなければならない。
// jest.mockにて利用する変数はさらにその先に定義する。
// またjest.mockのスコープ外の変数を利用する場合は、変数名の先頭にmockをつける必要がある。
let mockError;
let mockActionFn;

jest.mock('@/store', () => {
  const _vuex = require('vuex');
  return new _vuex.Store({
    modules: {
      note: {
        namespaced: true,
        actions: {
          getNotesByprojectId: jest.fn().mockImplementation(() => {
            mockActionFn();
            if (!mockError) {
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
  let newNoteId;
  let noteProjectId;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;
    noteProjectId = 300;
    newNoteId = 100;
    mockActionFn = jest.fn();

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
        getNotesByprojectId: jest.fn().mockImplementation(store => projectId => {
          return stateNote.notes.filter(note => note.project_id === projectId);
        }),
      },
      actions: {
        getNotesByprojectId: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
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

  describe('beforeRouteEnter', () => {
    let $route;
    beforeEach(async () => {
      $route = {
        name: 'AllNoteList',
        params: { projectId: 3 },
      };
    });

    it('初回遷移時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
      const next = jest.fn();
      AllNoteList.beforeRouteEnter($route, undefined, next);
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('初回遷移時、API接続にてエラーとなった場合、サインイン画面に遷移する', async () => {
      mockError = true;
      let nextRoute = '';
      const next = jest.fn().mockImplementation(route => {
        nextRoute = route;
      });
      AllNoteList.beforeRouteEnter($route, undefined, next);
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(nextRoute.name).toBe('signin');
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
  });
});
