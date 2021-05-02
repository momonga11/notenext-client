import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import ChangePassword from '@/views/ChangePassword.vue';
import flushPromises from 'flush-promises';
import message from '@/consts/message';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';
import HttpStoreMock from '../modules/http';

describe('ChangePassword.vue', () => {
  let wrapper;
  let store;
  let router;
  let authStoreMock;
  let vuetify;
  let mockError;
  let query;
  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;

    authStoreMock = {
      namespaced: true,
      actions: {
        updatePassword: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
      },
    };

    store = new Vuex.Store({
      modules: {
        error: new ErrorStoreMock().getMock(),
        auth: authStoreMock,
        http: HttpStoreMock.getMock(),
      },
    });

    router = new VueRouter({
      routes,
    });

    query = { client: 'test-client', expiry: 'test-expiry', uid: 'test-uid', 'access-token': 'test-access-token' };

    router.push({
      name: 'changePassword',
      query,
    });

    vuetify = new Vuetify();
    wrapper = mount(ChangePassword, {
      store,
      localVue,
      router,
      vuetify,
    });

    await flushPromises();
  });

  describe('パスワード', () => {
    let input = '';
    let inputConfirm = '';
    beforeEach(async () => {
      const password = 'test-password';

      input = wrapper.find('#password-changepassword');
      inputConfirm = wrapper.find('#password-confirm-changepassword');
      input.setValue(password);
      inputConfirm.setValue(password);

      await flushPromises();

      expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();
    });

    it('未入力にすると必須エラーとなる', async () => {
      input.setValue('');
      inputConfirm.setValue('');
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.updatePassword).not.toHaveBeenCalled();
    });

    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue('t'.repeat(20 + 1));
      inputConfirm.setValue('t'.repeat(20 + 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.updatePassword).not.toHaveBeenCalled();
    });

    it('最小文字数以下の値を入力すると、エラーとなる', async () => {
      input.setValue('t'.repeat(6 - 1));
      inputConfirm.setValue('t'.repeat(6 - 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.updatePassword).not.toHaveBeenCalled();
    });

    describe('パスワードと確認用パスワードが一致しない場合、エラー', () => {
      it('パスワード変更時', async () => {
        input.setValue('test-password-hoge');
        await flushPromises();

        const errorEl = wrapper.find('.v-messages__message');
        expect(errorEl.text()).toBeTruthy();

        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(authStoreMock.actions.updatePassword).not.toHaveBeenCalled();
      });
      it('パスワード確認用変更時', async () => {
        inputConfirm.setValue('test-password-hoge');
        await flushPromises();

        const errorEl = wrapper.find('.v-messages__message');
        expect(errorEl.text()).toBeTruthy();

        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(authStoreMock.actions.updatePassword).not.toHaveBeenCalled();
      });
    });

    it('パスワード表示アイコンを押下すると、パスワードが表示される', async () => {
      expect(inputConfirm.attributes().type).toBe('password');

      inputConfirm.element.parentNode.parentNode.querySelector('.v-icon').click();
      await flushPromises();

      expect(inputConfirm.attributes().type).toBe('text');
    });
  });

  describe('パスワード変更', () => {
    beforeEach(async () => {
      const password = 'test-password';

      wrapper.find('#password-changepassword').setValue(password);
      wrapper.find('#password-confirm-changepassword').setValue(password);

      await flushPromises();
    });

    it('パスワード変更に成功し、結果画面に遷移する', async () => {
      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('info');
      expect(wrapper.vm.$route.params.message).toBe(message.INFO_SUCCESS_RESET_PASSWORD);
    });

    it('パスワード変更に失敗した場合、遷移しない', async () => {
      mockError = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('');
      expect(wrapper.vm.$route.name).toBe('changePassword');
    });
  });

  describe('画面遷移', () => {
    const expectRedirectSignIn = () => {
      router.push({
        name: 'changePassword',
        query,
      });

      wrapper = mount(ChangePassword, {
        store,
        localVue,
        router,
        vuetify,
      });

      ChangePassword.beforeRouteEnter(wrapper.vm.$route, undefined, c => c(wrapper.vm));
      expect(wrapper.vm.$route.name).toBe('signin');
    };

    it('query.client がない場合、ログイン画面に遷移する', async () => {
      delete query.client;
      expectRedirectSignIn();
    });

    it('query.expiry がない場合、ログイン画面に遷移する', async () => {
      delete query.expiry;
      expectRedirectSignIn();
    });

    it('query.uid がない場合、ログイン画面に遷移する', async () => {
      delete query.uid;
      expectRedirectSignIn();
    });

    it('query.access-token がない場合、ログイン画面に遷移する', async () => {
      delete query['access-token'];
      expectRedirectSignIn();
    });

    it('query が全てある場合、ログイン画面に遷移しない', async () => {
      ChangePassword.beforeRouteEnter(wrapper.vm.$route, undefined, c => c(wrapper.vm));
      expect(wrapper.vm.$route.name).toBe('changePassword');
    });
  });
});
