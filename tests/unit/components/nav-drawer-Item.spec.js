import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import NavDrawerItem from '@/components/NavDrawerItem.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';

describe('NavDrawerItem.vue', () => {
  let wrapper;
  let store;
  let projectStoreMock;
  let folderStoreMock;
  let vuetify;
  let router;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    // Vuexストアのモックを作成する
    const stateProject = { id: 10, name: 'project-name', description: 'project-description', lock_version: 0 };
    projectStoreMock = {
      namespaced: true,
      state: stateProject,
      actions: {
        get: jest.fn().mockImplementation(() => {
          return Promise.resolve(stateProject);
        }),
      },
    };

    folderStoreMock = {
      namespaced: true,
      state: {
        folders: [
          { id: 1, name: 'folder-name', description: 'folder-description', lock_version: 0 },
          { id: 2, name: 'folder-name2', description: 'folder-description2', lock_version: 0 },
        ],
      },
    };

    store = new Vuex.Store({
      modules: {
        project: projectStoreMock,
        folder: folderStoreMock,
        error: new ErrorStoreMock().getMock(),
      },
    });

    router = new VueRouter({
      routes,
      mode: 'abstract',
    });

    vuetify = new Vuetify();
    wrapper = mount(NavDrawerItem, {
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

  it('storeのプロジェクト名が表示されること', () => {
    expect(wrapper.text()).toMatch(projectStoreMock.state.name);
  });

  it('storeのフォルダ名が全件表示されること', () => {
    expect(wrapper.text()).toMatch(folderStoreMock.state.folders[0].name);
    expect(wrapper.text()).toMatch(folderStoreMock.state.folders[1].name);
  });

  it('プロジェクト設定ボタンを押下すると、プロジェクト設定ダイヤログが表示されること', async () => {
    expect(wrapper.find('.v-dialog--active').exists()).toBeFalsy();
    wrapper.find('#open-project-setting-dialog-navdrawer').trigger('click');
    await flushPromises();

    expect(wrapper.find('.v-dialog--active').exists()).toBeTruthy();
  });

  it('フォルダ新規作成ボタンを押下すると、フォルダ設定ダイヤログが表示されること', async () => {
    expect(wrapper.find('.v-dialog--active').exists()).toBeFalsy();
    wrapper.find('#open-folder-create-dialog-navdrawer').trigger('click');
    await flushPromises();

    expect(wrapper.find('.v-dialog--active').exists()).toBeTruthy();
  });

  describe('新規ノートボタン押下', () => {
    it('AllNoteList画面に遷移すること', async () => {
      wrapper.find('#allnotelist-link-navdrawer').trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('AllNoteList');
    });

    it('クエリ文字列が設定されていた場合、クエリ文字列を引き継いで、AllNoteList画面に遷移すること', async () => {
      await router.push({ query: { search: 'test' } });
      wrapper.find('#allnotelist-link-navdrawer').trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('AllNoteList');
      expect(wrapper.vm.$route.query.search).toBe('test');
    });
  });

  describe('フォルダリスト（複数分）押下', () => {
    it('フォルダ1のリストを押下すると、NoteList画面に遷移すること', async () => {
      const target = folderStoreMock.state.folders[0];
      wrapper.find(`a[href*='folders/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('NoteList');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(target.id);
    });

    it('フォルダ2のリストを押下すると、NoteList画面に遷移すること', async () => {
      const target = folderStoreMock.state.folders[1];
      wrapper.find(`a[href*='folders/${target.id}']`).trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('NoteList');
      expect(wrapper.vm.$route.params.projectId).toBe(projectStoreMock.state.id);
      expect(wrapper.vm.$route.params.folderId).toBe(target.id);
    });
  });

  it('クエリ文字列が設定されていた場合、クエリ文字列を引き継いで、NoteList画面に遷移すること', async () => {
    await router.push({ query: { search: 'test' } });

    const target = folderStoreMock.state.folders[1];
    wrapper.find(`a[href*='folders/${target.id}']`).trigger('click');
    await flushPromises();

    expect(wrapper.vm.$route.name).toBe('NoteList');
    expect(wrapper.vm.$route.query.search).toBe('test');
  });
});
