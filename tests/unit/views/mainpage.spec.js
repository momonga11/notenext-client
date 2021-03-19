import { shallowMount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import MainPage from '@/views/MainPage.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';

// jest.mockはdescribeより先に定義しなければならない。
// jest.mockにて利用する変数はさらにその先に定義する。
// またjest.mockのスコープ外の変数を利用する場合は、変数名の先頭にmockをつける必要がある。
let mockError;
let mockErrorStatus;
let mockActionFn;

jest.mock('@/store', () => {
  const _vuex = require('vuex');
  return new _vuex.Store({
    modules: {
      project: {
        namespaced: true,
        actions: {
          getWithAssociation: jest.fn().mockImplementation(() => {
            mockActionFn();
            if (!mockError) {
              return Promise.resolve();
            }
            const error = { response: { status: mockErrorStatus } };
            return Promise.reject(error);
          }),
        },
      },
    },
  });
});

describe('MainPage.vue', () => {
  let wrapper;
  let store;
  let projectStoreMock;
  let vuetify;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;
    mockErrorStatus = 403;
    mockActionFn = jest.fn();

    // Vuexストアのモックを作成する
    projectStoreMock = {
      namespaced: true,
      actions: {
        getWithAssociation: jest.fn().mockImplementation(() => {
          mockActionFn();
          if (!mockError) {
            return Promise.resolve();
          }
          const error = { response: { status: mockErrorStatus } };
          return Promise.reject(error);
        }),
      },
    };

    store = new Vuex.Store({
      modules: {
        project: projectStoreMock,
        error: new ErrorStoreMock().getMock(),
      },
    });

    const router = new VueRouter({
      routes,
    });
    router.push({ name: 'NoteList' });

    vuetify = new Vuetify();
    wrapper = shallowMount(MainPage, {
      propsData: { projectId: 1 },
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
        name: 'Note',
        params: { projectId: 3 },
      };
    });

    it('初回遷移時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
      const next = jest.fn();
      MainPage.beforeRouteEnter($route, undefined, next);
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('初回遷移時、API接続にてエラーとなった場合、エラーステータスが403であれば、サインイン画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 403;
      MainPage.beforeRouteEnter($route, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('signin');
    });

    it('初回遷移時、API接続にてエラーとなった場合、エラーステータスが401,403以外であれば、AllNoteList画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 501;
      MainPage.beforeRouteEnter($route, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('AllNoteList');
    });
  });

  describe('beforeRouteUpdate', () => {
    let $routeBefore;
    let $routeAfter;
    beforeEach(async () => {
      $routeBefore = {
        name: 'Note',
        params: { projectId: 3 },
      };

      $routeAfter = {
        name: 'Note',
        params: { projectId: 4 },
      };
    });

    it('route更新時、API接続にてプロジェクト情報を取得できた場合、目的の画面に遷移する', async () => {
      const next = jest.fn();
      // thisをwrapperに指定する
      MainPage.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、遷移元と遷移先のProjectIdが同一の場合、API接続を実行せず、目的の画面に遷移する', async () => {
      $routeAfter.params.projectId = $routeBefore.params.projectId;
      const next = jest.fn();
      // thisをwrapperに指定する
      MainPage.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(mockActionFn).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('route更新時、API接続にてエラーとなった場合、エラーステータスが403であれば、サインイン画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 403;
      const next = jest.fn();
      MainPage.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('signin');
    });

    it('初回遷移時、API接続にてエラーとなった場合、エラーステータスが401,403以外であれば、AllNoteList画面に遷移する', async () => {
      mockError = true;
      mockErrorStatus = 501;
      const next = jest.fn();
      MainPage.beforeRouteUpdate.call(wrapper.vm, $routeBefore, $routeAfter, next);
      await flushPromises();

      expect(mockActionFn).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('AllNoteList');
    });
  });
});
