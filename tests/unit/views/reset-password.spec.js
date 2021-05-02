import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import ResetPassword from '@/views/ResetPassword.vue';
import flushPromises from 'flush-promises';
import message from '@/consts/message';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';
import HttpStoreMock from '../modules/http';

describe('resetPassword.vue', () => {
  let wrapper;
  let store;
  let authStoreMock;
  let vuetify;
  let mockError;
  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;

    authStoreMock = {
      namespaced: true,
      actions: {
        resetPassword: jest.fn().mockImplementation(() => {
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

    const router = new VueRouter({
      routes,
    });
    router.push({ name: 'resetPassword' });

    vuetify = new Vuetify();
    wrapper = mount(ResetPassword, {
      store,
      localVue,
      router,
      vuetify,
    });
    await flushPromises();
  });

  describe('メールアドレス', () => {
    let input = '';
    beforeEach(async () => {
      input = wrapper.find('#email-resetPassword');
      await flushPromises();

      expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();
    });

    it('未入力にすると必須エラーとなる', async () => {
      input.setValue('');
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.resetPassword).not.toHaveBeenCalled();
    });

    it('形式不正の場合、エラーになる', async () => {
      input.setValue('test-email');
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.resetPassword).not.toHaveBeenCalled();
    });
    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue(`test@e.com${'t'.repeat(125 + 1)}`);
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('パスワードリセット', () => {
    beforeEach(async () => {
      wrapper.find('#email-resetPassword').setValue('test@email.com');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
    });

    it('パスワードリセットに成功し、結果画面に遷移する', async () => {
      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('info');
      expect(wrapper.vm.$route.params.message).toBe(message.INFO_SEND_RESET_PASSWORD_MAIL);
    });

    it('パスワードリセットに失敗した場合、遷移しない', async () => {
      mockError = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('');
      expect(wrapper.vm.$route.name).toBe('resetPassword');
    });
  });

  it('redirect signinView', () => {
    wrapper.find('#signin-link').trigger('click');
    expect(wrapper.vm.$route.name).toBe('signin');
  });
});
