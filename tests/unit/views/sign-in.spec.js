import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import SignIn from '@/views/SignIn.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock, rejectError } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

describe('SignIn.vue', () => {
  let wrapper;
  let store;
  let projectStoreMock;
  let authStoreMock;
  let vuetify;
  let mockError;
  let mockErrorGetProjects;
  let mockErrorCreateProject;
  let mockNotJoinProject;
  const mockProjectId = 1;
  const mockCreateProjectId = 2;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;
    mockErrorGetProjects = false;
    mockErrorCreateProject = false;
    mockNotJoinProject = false;

    // Vuexストアのモックを作成する
    projectStoreMock = {
      namespaced: true,
      actions: {
        getProjects: jest.fn().mockImplementation(() => {
          if (mockErrorGetProjects) {
            return rejectError(wrapper);
          }

          if (mockNotJoinProject) {
            return Promise.resolve([]);
          }
          return Promise.resolve([{ id: mockProjectId }]);
        }),
        create: jest.fn().mockImplementation(() => {
          if (mockErrorCreateProject) {
            return rejectError(wrapper);
          }
          return Promise.resolve({ id: mockCreateProjectId });
        }),
      },
    };

    authStoreMock = {
      namespaced: true,
      state: {
        id: null,
        name: null,
        email: null,
        avatar: '',
        header: {
          client: null,
          accessToken: null,
          uid: null,
          expiry: null,
          tokenType: null,
        },
      },
      actions: {
        signin: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        signin_sample: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
      },
    };

    store = new Vuex.Store({
      modules: {
        project: projectStoreMock,
        error: new ErrorStoreMock().getMock(),
        auth: authStoreMock,
      },
    });

    const router = new VueRouter({
      routes,
    });
    router.push({ name: 'signin' });

    vuetify = new Vuetify();
    wrapper = mount(SignIn, {
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
      input = wrapper.find('#email-signin');
      wrapper.find('#password-signin').setValue('test-password');
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

      expect(authStoreMock.actions.signin).not.toHaveBeenCalled();
    });

    it('形式不正の場合、エラーになる', async () => {
      input.setValue('test-email');
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.signin).not.toHaveBeenCalled();
    });
    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue(`test@e.com${'t'.repeat(125 + 1)}`);
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.signin).not.toHaveBeenCalled();
    });
  });

  describe('パスワード', () => {
    let input = '';
    beforeEach(async () => {
      input = wrapper.find('#password-signin');
      wrapper.find('#email-signin').setValue('test@email.com');
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

      expect(authStoreMock.actions.signin).not.toHaveBeenCalled();
    });

    it('パスワード表示アイコンを押下すると、パスワードが表示される', async () => {
      expect(input.attributes().type).toBe('password');

      input.element.parentNode.parentNode.querySelector('.v-icon').click();
      await flushPromises();

      expect(input.attributes().type).toBe('text');
    });
  });

  describe('ログイン', () => {
    beforeEach(async () => {
      wrapper.find('#email-signin').setValue('test@email.com');
      wrapper.find('#password-signin').setValue('test-password');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
    });

    it('サインインに成功し、所属プロジェクトのビューに遷移する', async () => {
      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.vm.alert).toBeFalsy();
      expect(wrapper.vm.$route.name).toBe('AllNoteList');
      expect(wrapper.vm.$route.params.projectId).toBe(mockProjectId);
    });

    it('サインインに成功し、所属プロジェクトが存在しない場合は、プロジェクトを作成し、遷移する', async () => {
      mockNotJoinProject = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.vm.alert).toBeFalsy();
      expect(wrapper.vm.$route.name).toBe('AllNoteList');
      expect(wrapper.vm.$route.params.projectId).toBe(mockCreateProjectId);
    });

    it('サインインに失敗した場合、遷移しない', async () => {
      mockError = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('');
      expect(wrapper.vm.$route.name).toBe('signin');
    });

    it('サインインに成功したが、所属プロジェクト取得に失敗した場合、遷移しない', async () => {
      mockErrorGetProjects = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('');
      expect(wrapper.vm.$route.name).toBe('signin');
    });

    it('サインインに成功したが、プロジェクト作成に失敗した場合、遷移しない', async () => {
      mockNotJoinProject = true;
      mockErrorCreateProject = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('');
      expect(wrapper.vm.$route.name).toBe('signin');
    });
  });

  it('redirect ResetPasswordView', () => {
    wrapper.find('#reset-password-link').trigger('click');
    expect(wrapper.vm.$route.name).toBe('resetPassword');
  });

  it('redirect SignUpView', () => {
    wrapper.find('#signup-link').trigger('click');
    expect(wrapper.vm.$route.name).toBe('signup');
  });

  describe('サンプルログイン', () => {
    beforeEach(async () => {
      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
    });

    it('サインインに成功し、所属プロジェクトのビューに遷移する', async () => {
      wrapper.find('#sample-login-button').trigger('click');
      await flushPromises();

      expect(wrapper.vm.alert).toBeFalsy();
      expect(wrapper.vm.$route.name).toBe('AllNoteList');
      expect(wrapper.vm.$route.params.projectId).toBe(mockProjectId);
    });

    it('サインインに失敗した場合、遷移しない', async () => {
      mockError = true;

      wrapper.find('#sample-login-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#error-alert').element.style.display).toBe('');
      expect(wrapper.vm.$route.name).toBe('signin');
    });
  });

  it('confirm alert', async () => {
    expect(wrapper.vm.confirmedSuccess).toBeFalsy();
    expect(wrapper.find('#alert').element.style.display).toBe('none');

    wrapper.vm.$router.push({ name: 'signin', query: { account_confirmation_success: 'true' } });
    await flushPromises();

    expect(wrapper.vm.confirmedSuccess).toBeTruthy();
    expect(wrapper.find('#alert').element.style.display).toBe('');
  });
});
