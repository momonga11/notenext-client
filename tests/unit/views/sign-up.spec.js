import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import SignUp from '@/views/SignUp.vue';
import flushPromises from 'flush-promises';
import message from '@/consts/message';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';
import HttpStoreMock from '../modules/http';

describe('signup.vue', () => {
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
        signup: jest.fn().mockImplementation(() => {
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
    router.push({ name: 'signup' });

    vuetify = new Vuetify();
    wrapper = mount(SignUp, {
      store,
      localVue,
      router,
      vuetify,
    });

    await flushPromises();
  });

  describe('ユーザー名', () => {
    let input = '';
    beforeEach(async () => {
      input = wrapper.find('#user-name-signup');
      wrapper.find('#email-signup').setValue('test@email.com');
      wrapper.find('#password-signup').setValue('test-password');
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

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });

    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue('t'.repeat(255 + 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });
  });

  describe('メールアドレス', () => {
    let input = '';
    beforeEach(async () => {
      input = wrapper.find('#email-signup');
      wrapper.find('#user-name-signup').setValue('test-user-name');
      wrapper.find('#password-signup').setValue('test-password');
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

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });

    it('形式不正の場合、エラーになる', async () => {
      input.setValue('test-email');
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });
    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue(`test@e.com${'t'.repeat(125 + 1)}`);
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });
  });

  describe('パスワード', () => {
    let input = '';
    beforeEach(async () => {
      input = wrapper.find('#password-signup');
      wrapper.find('#user-name-signup').setValue('test-user-name');
      wrapper.find('#email-signup').setValue('test@email.com');
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

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });

    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue('t'.repeat(20 + 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });

    it('最小文字数以下の値を入力すると、エラーとなる', async () => {
      input.setValue('t'.repeat(6 - 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.signup).not.toHaveBeenCalled();
    });

    it('パスワード表示アイコンを押下すると、パスワードが表示される', async () => {
      expect(input.attributes().type).toBe('password');

      input.element.parentNode.parentNode.querySelector('.v-icon').click();
      await flushPromises();

      expect(input.attributes().type).toBe('text');
    });
  });

  describe('サインアップ', () => {
    beforeEach(async () => {
      wrapper.find('#user-name-signup').setValue('test-user-name');
      wrapper.find('#email-signup').setValue('test@email.com');
      wrapper.find('#password-signup').setValue('test-password');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
    });

    it('サインアップに成功し、結果画面に遷移する', async () => {
      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.vm.$route.name).toBe('info');
      expect(wrapper.vm.$route.params.message).toBe(message.INFO_MAIL_CONFIRMATION);
    });

    it('サインアップに失敗した場合、遷移しない', async () => {
      mockError = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('');
      expect(wrapper.vm.$route.name).toBe('signup');
    });
  });

  it('redirect signinView', () => {
    wrapper.find('#signin-link').trigger('click');
    expect(wrapper.vm.$route.name).toBe('signin');
  });
});
