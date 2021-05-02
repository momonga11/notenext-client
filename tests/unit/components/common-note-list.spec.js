import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import CommonNoteList from '@/components/CommonNoteList.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

describe('CommonNoteList.vue', () => {
  let wrapper;
  let store;
  let folderStoreMock;
  let vuetify;
  let mockError;
  let router;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;

    // Vuexストアのモックを作成する
    folderStoreMock = {
      namespaced: true,
      state: {
        folders: [],
      },
      actions: {
        getFoldersExistsNote: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        getFolders: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
      },
    };

    store = new Vuex.Store({
      modules: {
        error: new ErrorStoreMock().getMock(),
        folder: folderStoreMock,
      },
    });

    // vue-routerのインスタンスをテストごとに確実にリセットするためには、modeをabstractにする必要がある
    router = new VueRouter({
      routes,
      mode: 'abstract',
    });

    vuetify = new Vuetify();
    wrapper = mount(CommonNoteList, {
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

  it('searchedAlertHeight is not 0 when exists props.searchQuery ', async () => {
    expect(wrapper.vm.searchedAlertHeight).toBe(0);

    const searchQuery = 'test';
    await wrapper.setProps({ searchQuery });

    expect(wrapper.vm.searchedAlertHeight).not.toBe(0);
    expect(wrapper.vm.alert).toBe(true);
  });

  describe('初回起動時', () => {
    beforeEach(async () => {
      const searchQuery = 'test';
      wrapper = mount(CommonNoteList, {
        store,
        localVue,
        router,
        vuetify,
        propsData: { searchQuery },
      });

      await flushPromises();
    });

    it('props.searchQueryの値が存在する場合、検索中アラートが表示されること', async () => {
      expect(wrapper.find('#searched-alert').exists()).toBeTruthy();
    });

    it('props.searchQueryの値が存在する場合、APIに接続されること', async () => {
      expect(folderStoreMock.actions.getFoldersExistsNote).toHaveBeenCalled();
    });
  });

  it('props.searchQueryに値が設定されると、検索中アラートが表示されること', async () => {
    expect(wrapper.find('#searched-alert').exists()).toBeFalsy();

    const searchQuery = 'test';
    await wrapper.setProps({ searchQuery });

    const alert = wrapper.find('#searched-alert');
    expect(alert.exists()).toBeTruthy();
    expect(alert.text()).toMatch(searchQuery);
  });

  describe('closeSearchedAleart', () => {
    const searchQuery = 'test';
    beforeEach(async () => {
      await wrapper.setProps({ searchQuery });
      wrapper.vm.$router.push({ name: 'NoteList', query: { search: searchQuery } });
    });

    it('要素のevents.inputにて、メソッドが呼ばれること', async () => {
      const mockFn = jest.fn();
      wrapper = mount(CommonNoteList, {
        store,
        localVue,
        router,
        vuetify,
        propsData: { searchQuery },
        methods: {
          closeSearchedAlert() {
            mockFn();
          },
        },
      });

      await wrapper.find('#searched-alert').trigger('input');
      expect(mockFn).toHaveBeenCalled();
    });

    it('closeSearchedAlertメソッドにて、alert=Trueの場合、API接続が実行されず、現在のルートに変更がないこと', async () => {
      const currentRoute = wrapper.vm.$route;

      await wrapper.vm.closeSearchedAlert(true);
      expect(folderStoreMock.actions.getFolders).not.toHaveBeenCalled();
      expect(wrapper.vm.$route).toBe(currentRoute);
      expect(wrapper.vm.$route.query.search).not.toBeUndefined();
    });

    it('closeSearchedAlertメソッドにて、alert=Falseの場合、API接続が実行され、ルートのqueryがクリアされること', async () => {
      const currentRoute = wrapper.vm.$route;

      await wrapper.vm.closeSearchedAlert(false);
      await flushPromises();

      expect(folderStoreMock.actions.getFolders).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe(currentRoute.name);
      expect(wrapper.vm.$route.query.search).toBeUndefined();
    });

    it('closeSearchedAlertメソッドにて、alert=Falseの場合、API接続にてエラーが発生した場合は、現在のルートに変更がないこと', async () => {
      mockError = true;
      const currentRoute = wrapper.vm.$route;

      await wrapper.vm.closeSearchedAlert(false);
      await flushPromises();

      expect(folderStoreMock.actions.getFolders).toHaveBeenCalled();
      expect(wrapper.vm.$route).toBe(currentRoute);
      expect(wrapper.vm.$route.query.search).not.toBeUndefined();
    });
  });

  describe('レスポンシブ対応(mobile時)', () => {
    const expectDisplayList = () => {
      expect(wrapper.find('#common-note-list-container').element.style.display).not.toBe('none');
      expect(wrapper.find('#common-note-main-container').element.style.display).toBe('none');
    };

    const expectDisplayMain = () => {
      expect(wrapper.find('#common-note-list-container').element.style.display).toBe('none');
      expect(wrapper.find('#common-note-main-container').element.style.display).not.toBe('none');
    };

    beforeEach(async () => {
      wrapper.vm.$vuetify.breakpoint.mobile = true;
      await flushPromises();
    });

    it('現在のルートがAllNoteListの場合、Note(Main)側のビューが非表示になること', async () => {
      await wrapper.vm.$router.push({ name: 'AllNoteList' });

      expectDisplayList();
    });

    it('現在のルートがNoteListの場合、Note(Main)側のビューが非表示になること', async () => {
      await wrapper.vm.$router.push({ name: 'NoteList' });

      expectDisplayList();
    });

    it('現在のルートがNoteの場合、List側のビューが非表示になること', async () => {
      await wrapper.vm.$router.push({ name: 'Note' });

      expectDisplayMain();
    });

    it('現在のルートがNoteInFolderの場合、List側のビューが非表示になること', async () => {
      await wrapper.vm.$router.push({ name: 'NoteInFolder' });

      expectDisplayMain();
    });
  });
});
