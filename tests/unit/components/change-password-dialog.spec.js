import { mount } from '@vue/test-utils';
import Vuex from 'vuex';
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue';
import flushPromises from 'flush-promises';
import Vuetify from 'vuetify';
import { ErrorStoreMock } from '../modules/error';
import mockActionSample from '../modules/mockActionSample';

describe('ChangePasswordDialog.vue', () => {
  let wrapper;
  let store;
  let authStoreMock;
  let mockError;
  let vuetify;

  beforeEach(async () => {
    mockError = false;

    authStoreMock = {
      namespaced: true,
      actions: {
        updateCurrentPassword: jest.fn().mockImplementation(() => {
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

    vuetify = new Vuetify();

    wrapper = mount(ChangePasswordDialog, {
      store,
      vuetify,
    });

    // mobileモードは別途テストする
    wrapper.vm.$vuetify.breakpoint.mobile = false;
  });

  it('opendialogメソッドにて、ダイアログを開く', async () => {
    wrapper.vm.openDialog();
    await flushPromises();

    expect(wrapper.vm.dialog).toBeTruthy();
  });

  describe('ダイヤログを開いたのちの処理', () => {
    beforeEach(async () => {
      wrapper.vm.openDialog();
      await flushPromises();
    });

    it('×ボタンが押下されたとき、ダイアログを閉じる', async () => {
      wrapper.find('#close-button').trigger('click');
      expect(wrapper.vm.dialog).toBeFalsy();
    });

    it('キャンセルボタンが押下されたとき、ダイアログを閉じる', async () => {
      wrapper.find('#cancel-button').trigger('click');
      expect(wrapper.vm.dialog).toBeFalsy();
    });

    describe('入力項目のテスト', () => {
      let inputCurrentPassowrd = '';
      let inputNewPassword = '';
      let inputNewPasswordConfirm = '';

      beforeEach(async () => {
        const password = 'test-password';

        inputCurrentPassowrd = wrapper.find('#current-password-changepassword-dialog');
        inputNewPassword = wrapper.find('#password-changepassword-dialog');
        inputNewPasswordConfirm = wrapper.find('#password-confirm-changepassword-dialog');
        inputCurrentPassowrd.setValue(`new-${password}`);
        inputNewPassword.setValue(password);
        inputNewPasswordConfirm.setValue(password);

        await flushPromises();
      });

      describe('現在のパスワード', () => {
        it('未入力にすると必須エラーとなる', async () => {
          inputCurrentPassowrd.setValue('');
          await flushPromises();

          expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
        });

        it('最大文字数以上の値を入力すると、エラーとなる', async () => {
          inputCurrentPassowrd.setValue('t'.repeat(20 + 1));
          await flushPromises();

          expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
        });

        it('最小文字数以下の値を入力すると、エラーとなる', async () => {
          inputCurrentPassowrd.setValue('t'.repeat(6 - 1));
          await flushPromises();

          expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
        });
      });

      describe('新しいパスワード（確認用も含む）', () => {
        it('未入力にすると必須エラーとなる', async () => {
          inputNewPassword.setValue('');
          inputNewPasswordConfirm.setValue('');
          await flushPromises();

          expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
        });

        it('最大文字数以上の値を入力すると、エラーとなる', async () => {
          inputNewPassword.setValue('t'.repeat(20 + 1));
          inputNewPasswordConfirm.setValue('t'.repeat(20 + 1));
          await flushPromises();

          expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
        });

        it('最小文字数以下の値を入力すると、エラーとなる', async () => {
          inputNewPassword.setValue('t'.repeat(6 - 1));
          inputNewPasswordConfirm.setValue('t'.repeat(6 - 1));
          await flushPromises();

          expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
        });

        describe('パスワードと確認用パスワードが一致しない場合、エラー', () => {
          it('パスワード変更時', async () => {
            inputNewPassword.setValue('test-password-hoge');
            await flushPromises();

            expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

            wrapper.find('#commit-button').trigger('click');
            await flushPromises();

            expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
          });
          it('パスワード確認用変更時', async () => {
            inputNewPasswordConfirm.setValue('test-password-hoge');
            await flushPromises();

            expect(wrapper.find('.v-messages__message').text()).toBeTruthy();

            wrapper.find('#commit-button').trigger('click');
            await flushPromises();

            expect(authStoreMock.actions.updateCurrentPassword).not.toHaveBeenCalled();
          });
        });
      });

      describe('変更実行時', () => {
        it('submitボタンが押下されたとき、API接続にてエラーが発生しない場合、ダイアログを閉じる', async () => {
          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).toHaveBeenCalled();
          expect(wrapper.emitted().success).toBeTruthy();
          expect(wrapper.vm.dialog).toBeFalsy();
        });

        it('submitボタンが押下されたとき、API接続にてエラーが発生した場合、ダイアログを閉じない', async () => {
          mockError = true;

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(authStoreMock.actions.updateCurrentPassword).toHaveBeenCalled();
          expect(wrapper.vm.dialog).toBeTruthy();
        });
      });
    });
  });
});
