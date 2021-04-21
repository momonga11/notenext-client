import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import HeaderItem from '@/components/HeaderItem.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

describe('HeaderItem.vue', () => {
  let wrapper;
  let store;
  let authStoreMock;
  let vuetify;
  let mockError;
  let router;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;

    // Vuexストアのモックを作成する
    const mockAuthState = {
      id: 1,
      name: 'test-user',
      email: 'test-email@test.com',
      avatar: 'https://test-avatar.jpg',
      header: {
        client: null,
        accessToken: null,
        uid: null,
        expiry: null,
        tokenType: null,
      },
    };

    authStoreMock = {
      namespaced: true,
      state: mockAuthState,
      actions: {
        signout: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
      },
    };

    store = new Vuex.Store({
      modules: {
        error: new ErrorStoreMock().getMock(),
        auth: authStoreMock,
      },
    });

    // vue-routerのインスタンスをテストごとに確実にリセットするためには、modeをabstractにする必要がある
    router = new VueRouter({
      routes,
      mode: 'abstract',
    });

    vuetify = new Vuetify();
    wrapper = mount(HeaderItem, {
      store,
      localVue,
      router,
      vuetify,
    });
  });

  it('drawerボタンを押下すると、emitが発生する', async () => {
    wrapper.find('.v-app-bar__nav-icon').trigger('click');
    await flushPromises();

    expect(wrapper.emitted()['nav-icon-click']).toBeTruthy();
  });

  describe('ユーザー情報メニュー', () => {
    beforeEach(async () => {
      // メニューを開く
      wrapper.find('#avatar-header').trigger('click');
      await flushPromises();

      expect(wrapper.vm.menuValue).toBeTruthy();
    });

    it('ユーザー設定リストを押下すると、UserEditへ遷移する', async () => {
      wrapper.find('#useredit-header').trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('UserEdit');
      expect(wrapper.vm.menuValue).toBeFalsy();
    });

    describe('ログアウト', () => {
      it('ログアウトリストを押下すると、ログアウト処理が実行される', async () => {
        wrapper.find('#signout-header').trigger('click');
        await flushPromises();

        expect(authStoreMock.actions.signout).toHaveBeenCalled();
        expect(wrapper.vm.menuValue).toBeFalsy();
      });

      it('ログアウトリストを押下すると、APIエラーの場合はエラーメッセージが表示される', async () => {
        mockError = true;
        wrapper.find('#signout-header').trigger('click');
        await flushPromises();

        expect(authStoreMock.actions.signout).toHaveBeenCalled();
        expect(wrapper.find('#error-alert').element.style.display).toBe('');
        expect(wrapper.vm.menuValue).toBeFalsy();
      });
    });
  });

  describe('ノート検索', () => {
    it('renders props.searchQuery when passed', async () => {
      // Props
      const searchQuery = 'test';
      await wrapper.setProps({ searchQuery });

      expect(wrapper.props().searchQuery).toBe(searchQuery);
    });

    it('初回起動時、props.searchQueryの値がノート検索テキストフィールドに表示されること', async () => {
      const searchQuery = 'test';
      wrapper = mount(HeaderItem, {
        store,
        localVue,
        router,
        vuetify,
        propsData: { searchQuery },
      });

      await flushPromises();

      expect(wrapper.find('#search-notes').element.value).toBe(searchQuery);
    });

    describe('when input search note text And execute searchNote', () => {
      let input = '';
      let searchIcon = '';
      let inputValue = '';
      beforeEach(async () => {
        input = wrapper.find('#search-notes');
        searchIcon = wrapper.find('#search-notes-container button[aria-label="append icon"]');
        inputValue = 'testvalue';

        // ビューの変更検知のため、デフォルトとして設定する（この処理がない場合、$route.pushされたqueryが上書きされないので注意）
        router.push({ name: 'NoteList' });
      });

      it('虫眼鏡アイコンを押下すると、AllNoteListビューに画面遷移する', async () => {
        input.setValue(inputValue);
        searchIcon.trigger('click');
        await flushPromises();

        expect(wrapper.vm.$route.name).toBe('AllNoteList');
        expect(wrapper.vm.$route.query.search).toBe(inputValue);
      });

      it('EnterKeyを押下すると、AllNoteListビューに画面遷移する', async () => {
        input.setValue(inputValue);
        input.trigger('keypress.enter');
        await flushPromises();

        expect(wrapper.vm.$route.name).toBe('AllNoteList');
        expect(wrapper.vm.$route.query.search).toBe(inputValue);
      });

      it('同じビューかつprops.searchQueryと$route.query.searchが同じ値の場合、画面をリロードする(=AllNoteListに遷移)', async () => {
        // 遷移先と同じビューに移動する
        router.push({
          name: 'AllNoteList',
          query: { search: inputValue },
        });
        await flushPromises();

        input.setValue(inputValue);
        input.trigger('keypress.enter');
        await flushPromises();

        expect(wrapper.vm.$route.name).toBe('AllNoteList');
        expect(wrapper.vm.$route.query.search).toBe(inputValue);
      });
    });
  });
});
