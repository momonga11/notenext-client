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

    const router = new VueRouter({
      routes,
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

  it('ノートタブを押下すると、AllNotelistへ遷移する', async () => {
    wrapper.find('#note-tab-header').trigger('click');
    await flushPromises();

    expect(wrapper.vm.$route.name).toBe('AllNoteList');
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
});
