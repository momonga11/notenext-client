import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import Vuetify from 'vuetify';
import UserEdit from '@/views/UserEdit.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

// jest.mockはdescribeより先に定義しなければならない。
// jest.mockにて利用する変数はさらにその先に定義する。
// またjest.mockのスコープ外の変数を利用する場合は、変数名の先頭にmockをつける必要がある。
let mockError;
let mockErrorStatus;
let mockAuthState;

jest.mock('@/store', () => {
  const _vuex = require('vuex');
  return new _vuex.Store({
    modules: {
      auth: {
        namespaced: true,
        actions: {
          get: jest.fn().mockImplementation(() => {
            if (!mockError) {
              return Promise.resolve(mockAuthState);
            }
            const error = { response: { status: mockErrorStatus } };
            return Promise.reject(error);
          }),
        },
      },
    },
  });
});

describe('UserEdit.vue', () => {
  let wrapper;
  let store;
  let projectStoreMock;
  let authStoreMock;
  let vuetify;
  let mockErrorProject;

  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    mockError = false;
    mockErrorStatus = 403;
    mockErrorProject = false;

    // Vuexストアのモックを作成する
    projectStoreMock = {
      namespaced: true,
      actions: {
        delete: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockErrorProject);
        }),
      },
    };

    mockAuthState = {
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
        update: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        delete: jest.fn().mockImplementation(() => {
          return mockActionSample(wrapper, mockError);
        }),
        deleteAvatar: jest.fn().mockImplementation(() => {
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
    router.push({ name: 'UserEdit' });

    vuetify = new Vuetify();
    wrapper = mount(UserEdit, {
      store,
      localVue,
      router,
      vuetify,
    });
  });

  it('初回遷移時、API接続にてユーザー情報を取得できた場合、propsに値を設定する', async () => {
    UserEdit.beforeRouteEnter(wrapper.vm, undefined, c => c(wrapper.vm));
    await flushPromises();

    expect(wrapper.vm.auth.name).toBe(mockAuthState.name);
  });

  it('初回遷移時、API接続にてユーザー情報を取得できなかった場合、エラーステータスが403であれば、サインイン画面に遷移する', async () => {
    mockError = true;
    mockErrorStatus = 403;
    UserEdit.beforeRouteEnter(wrapper.vm, undefined, c => c(wrapper.vm));
    await flushPromises();

    expect(wrapper.vm.$route.name).toBe('signin');
  });

  it('初回遷移時、API接続にてユーザー情報を取得できなかった場合、エラーステータスが401,403以外であれば、AllNoteList画面に遷移する', async () => {
    mockError = true;
    mockErrorStatus = 501;
    UserEdit.beforeRouteEnter(wrapper.vm, undefined, c => c(wrapper.vm));
    await flushPromises();

    expect(wrapper.vm.$route.name).toBe('AllNoteList');
  });

  describe('ユーザー名', () => {
    let input = '';
    beforeEach(async () => {
      input = wrapper.find('#user-name-useredit');
      wrapper.find('#email-useredit').setValue('test@email.com');
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

      expect(authStoreMock.actions.update).not.toHaveBeenCalled();
    });

    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue('t'.repeat(255 + 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.update).not.toHaveBeenCalled();
    });
  });

  describe('メールアドレス', () => {
    let input = '';
    beforeEach(async () => {
      input = wrapper.find('#email-useredit');
      wrapper.find('#user-name-useredit').setValue('test-password');
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

      expect(authStoreMock.actions.update).not.toHaveBeenCalled();
    });

    it('形式不正の場合、エラーになる', async () => {
      input.setValue('test-email');
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.update).not.toHaveBeenCalled();
    });
    it('最大文字数以上の値を入力すると、エラーとなる', async () => {
      input.setValue(`test@e.com${'t'.repeat(125 + 1)}`);
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.update).not.toHaveBeenCalled();
    });
  });

  describe('画像ファイル', () => {
    let input;

    // 画像ファイルをアップロードするイベントを実行する
    const fileUpload = async file => {
      // wrapper.trigger()では、elementのtargetは読み取り専用のため設定できない。
      // そのため別口から値を設定する
      Object.defineProperty(input.element, 'files', {
        value: [file],
      });

      input.trigger('change');
      // changeイベントにて、複数回非同期処理が実行されるため、複数回呼び出す（苦肉の策...）
      await flushPromises();
      await flushPromises();
      await flushPromises();
    };

    beforeEach(async () => {
      wrapper.find('#image-avatar-useredit').trigger('click');
      await flushPromises();

      input = wrapper.find('#avatar-upload');
      expect(wrapper.find('#alert-useredit').element.style.display).toBe('none');
      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
      expect(wrapper.find('#error-message-useredit').exists()).toBeFalsy();
    });

    it('画像アップロードメニューをクリックすると、ファイル選択ダイヤログが開く', async () => {
      const clickmock = jest.fn();
      input.element.onclick = clickmock;

      wrapper.find('#select-imagefile').trigger('click');
      await flushPromises();

      expect(clickmock).toHaveBeenCalled();
    });

    it('画像アップロードに成功する', async () => {
      const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
      await fileUpload(file);

      expect(authStoreMock.actions.update).toHaveBeenCalled();
      expect(wrapper.find('#alert-useredit').element.style.display).toBe('');
      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
      expect(wrapper.find('#error-message-useredit').exists()).toBeFalsy();
    });

    it('画像アップロード サイズエラー', async () => {
      const maxSizeOverContent = 't'.repeat(8192 * 1024 + 1);
      const file = new File([maxSizeOverContent], 'example.png', { type: 'image/png' });
      await fileUpload(file);

      expect(authStoreMock.actions.update).not.toHaveBeenCalled();
      expect(wrapper.find('#error-message-useredit').exists()).toBeTruthy();
    });

    it('画像アップロード 形式エラー', async () => {
      const file = new File(['dummy content'], 'example.text', { type: 'text/plain' });
      await fileUpload(file);

      expect(authStoreMock.actions.update).not.toHaveBeenCalled();
      expect(wrapper.find('#error-message-useredit').exists()).toBeTruthy();
    });

    it('画像アップロード APIエラー', async () => {
      mockError = true;
      const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
      await fileUpload(file);

      expect(authStoreMock.actions.update).toHaveBeenCalled();
      expect(wrapper.find('#error-alert').element.style.display).toBe('');
    });

    it('未設定の場合は削除項目が表示されない', async () => {
      expect(wrapper.find('#reset-imagefile').exists()).toBeFalsy();
    });

    describe('画像削除', () => {
      let item;
      const filename = 'example.png';

      beforeEach(async () => {
        // propsの設定
        UserEdit.beforeRouteEnter(wrapper.vm, undefined, c => c(wrapper.vm));
        await flushPromises();

        // 画像を設定
        const file = new File(['dummy content'], filename, { type: 'image/png' });
        await fileUpload(file);

        // メニューを開く
        wrapper.find('#image-avatar-useredit').trigger('click');
        await flushPromises();

        item = wrapper.find('#reset-imagefile');
        expect(item.exists()).toBeTruthy();
      });

      it('画像の削除を押下すると、画像削除処理が実行される', async () => {
        item.trigger('click');
        await flushPromises();

        expect(authStoreMock.actions.deleteAvatar).toHaveBeenCalled();
        expect(wrapper.vm.auth.avatar.filename).toBe('');
        expect(wrapper.vm.auth.avatar.data).toBe('');
        expect(wrapper.find('#alert-useredit').element.style.display).toBe('');
        expect(wrapper.find('#error-alert').element.style.display).toBe('none');
      });

      it('画像削除処理にて、APIエラーが発生した場合は、削除処理を実行しない', async () => {
        mockError = true;
        item.trigger('click');
        await flushPromises();

        expect(wrapper.vm.auth.avatar.filename).toBe(filename);
        expect(wrapper.vm.auth.avatar.data).not.toBe('');
        expect(wrapper.find('#alert-useredit').element.style.display).toBe('none');
        expect(wrapper.find('#error-alert').element.style.display).toBe('');
      });

      it('画像のvalidateエラーのメッセージが、削除成功にて消えること', async () => {
        await wrapper.setData({ avatarErrorMessage: 'test-error' });
        expect(wrapper.vm.avatarErrorMessage).toBe('test-error');

        item.trigger('click');
        await flushPromises();

        expect(wrapper.vm.avatarErrorMessage).toBe('');
      });
    });

    it('キャンセルを押下すると、メニューが閉じること', async () => {
      expect(wrapper.vm.isMenuOpen).toBeTruthy();

      wrapper.find('#cancel-imagemenu').trigger('click');
      await flushPromises();

      expect(wrapper.vm.isMenuOpen).toBeFalsy();
    });
  });

  describe('変更を保存ボタン押下', () => {
    beforeEach(async () => {
      UserEdit.beforeRouteEnter(wrapper.vm, undefined, c => c(wrapper.vm));
      await flushPromises();

      expect(wrapper.find('#alert-useredit').element.style.display).toBe('none');
      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
    });

    it('メールアドレスが変わっていない場合は通常の変更完了メッセージをアラートを表示する', async () => {
      wrapper.find('#user-name-useredit').setValue('test-user2');
      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.update).toHaveBeenCalled();
      expect(wrapper.find('#alert-useredit').element.style.display).toBe('');
    });

    it('メールアドレスが変わっている場合はメール確認を促すメッセージをアラートを表示する', async () => {
      let alertMesssageSave;
      beforeEach(async () => {
        wrapper.find('#commit-button').trigger('click');
        await flushPromises();
        alertMesssageSave = wrapper.vm.alertMessage;
      });

      wrapper.find('#email-useredit').setValue('test2@email.com');
      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(authStoreMock.actions.update).toHaveBeenCalled();
      expect(wrapper.find('#alert-useredit').element.style.display).toBe('');
      expect(wrapper.vm.alertMessage).not.toBe(alertMesssageSave);
    });

    it('保存に失敗した場合、エラーアラートが表示される', async () => {
      mockError = true;

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.find('#alert-useredit').element.style.display).toBe('none');
      expect(wrapper.find('#error-alert').element.style.display).toBe('');
    });
  });

  it('×ボタンが押された時、AllNoteList画面に遷移する', () => {
    wrapper.find('#close-button').trigger('click');
    expect(wrapper.vm.$route.name).toBe('AllNoteList');
  });

  it('パスワード変更ボタンが押された時、パスワード変更ダイヤログを開く', async () => {
    expect(wrapper.find('#change-password-dialog-useredit .v-dialog--active').exists()).toBeFalsy();
    wrapper.find('#change-password-useredit').trigger('click');
    await flushPromises();

    expect(wrapper.find('#change-password-dialog-useredit .v-dialog--active').exists()).toBeTruthy();
  });

  it('アカウントを削除ボタンが押された時、アカウント削除確認ダイヤログを開く', async () => {
    expect(wrapper.find('#account-delete-dialog-useredit .v-dialog--active').exists()).toBeFalsy();
    wrapper.find('#account-delete-useredit').trigger('click');
    await flushPromises();

    expect(wrapper.find('#account-delete-dialog-useredit .v-dialog--active').exists()).toBeTruthy();
  });

  describe('アカウント削除', () => {
    beforeEach(() => {
      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
    });

    it('アカウント削除が実行された時、delete処理を実行し、画面遷移する', async () => {
      wrapper.vm.deleteAccount();
      await flushPromises();

      expect(projectStoreMock.actions.delete).toHaveBeenCalled();
      expect(authStoreMock.actions.delete).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('info');
      expect(wrapper.find('#error-alert').element.style.display).toBe('none');
    });

    it('プロジェクト削除のAPIで失敗した時、画面遷移しない', async () => {
      mockErrorProject = true;
      wrapper.vm.deleteAccount();
      await flushPromises();

      expect(projectStoreMock.actions.delete).toHaveBeenCalled();
      expect(authStoreMock.actions.delete).not.toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('UserEdit');
      expect(wrapper.find('#error-alert').element.style.display).toBe('');
    });

    it('ユーザー削除のAPIで失敗した時、画面遷移しない', async () => {
      mockError = true;
      wrapper.vm.deleteAccount();
      await flushPromises();

      expect(projectStoreMock.actions.delete).toHaveBeenCalled();
      expect(authStoreMock.actions.delete).toHaveBeenCalled();
      expect(wrapper.vm.$route.name).toBe('UserEdit');
      expect(wrapper.find('#error-alert').element.style.display).toBe('');
    });
  });
});
