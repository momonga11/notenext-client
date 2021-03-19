import { shallowMount, mount } from '@vue/test-utils';
import FolderSettingDialog from '@/components/FolderSettingDialog.vue';
import Vuex from 'vuex';
import flushPromises from 'flush-promises';
import constants from '../../../src/consts/constants';
import { ErrorStoreMock, rejectError } from '../modules/error';

describe('FolderSettingDialog.vue', () => {
  let store;
  let folderStoreMock;
  let wrapper;
  let mockError;

  const state = {
    folders: [{ id: 1, name: 'test-name', description: 'hogehoge', lock_version: 0 }],
  };

  beforeEach(() => {
    mockError = false;

    // Vuexストアのモックを作成する
    folderStoreMock = {
      namespaced: true,
      state,
      actions: {
        get: jest.fn().mockImplementation((st, { id }) => {
          const fl = state.folders.find(folder => folder.id === id);
          if (!mockError) {
            return Promise.resolve(fl);
          }
          return rejectError(wrapper);
        }),
        create: jest.fn().mockImplementation((st, payload) => {
          if (!mockError) {
            return Promise.resolve(payload);
          }
          return rejectError(wrapper);
        }),
        update: jest.fn().mockImplementation((st, { id }) => {
          const fl = state.folders.find(folder => folder.id === id);
          if (!mockError) {
            return Promise.resolve(fl);
          }
          return rejectError(wrapper);
        }),
      },
    };

    store = new Vuex.Store({
      modules: {
        folder: folderStoreMock,
        error: new ErrorStoreMock().getMock(),
      },
    });

    // shallowMountだと子コンポーネントをスタブによって描画しなくなる(高速化)
    wrapper = shallowMount(FolderSettingDialog, {
      propsData: { projectId: 1 },
      store,
    });
  });

  it('renders props.projectId And props.id when passed', async () => {
    // Props
    const projectId = 2;
    const id = 3;
    await wrapper.setProps({ projectId });
    await wrapper.setProps({ id });

    expect(wrapper.props().projectId).toBe(projectId);
    expect(wrapper.props().id).toBe(id);
  });

  describe('登録時', () => {
    it('opendialogメソッドにて、フォルダ情報を設定し、ダイアログを開く', async () => {
      wrapper.vm.openDialog();
      await flushPromises();

      expect(wrapper.vm.folder.name).toBe('');
      expect(wrapper.vm.folder.description).toBe('');
      expect(wrapper.vm.dialog).toBeTruthy();
    });

    it('更新時と各要素のテキストが異なること', async () => {
      // 更新時のテキストの値を取得する
      const id = 2;
      await wrapper.setProps({ id });

      wrapper.vm.openDialog();
      await flushPromises();

      const commitbtnTextUpdated = wrapper.find('formdialogcard-stub').attributes().commitbtntext;
      const titleTextUpdated = wrapper.find('formdialogcard-stub').attributes().titletext;

      // 登録時のテキストの値を取得する
      await wrapper.setProps({ id: null });

      wrapper.vm.openDialog();
      await flushPromises();

      const commitbtnTextCreated = wrapper.find('formdialogcard-stub').attributes().commitbtntext;
      const titleTextCreated = wrapper.find('formdialogcard-stub').attributes().titletext;

      expect(commitbtnTextUpdated).not.toBe(commitbtnTextCreated);
      expect(titleTextUpdated).not.toBe(titleTextCreated);
    });
  });

  describe('更新時', () => {
    it('opendialogメソッドにて、フォルダ情報を設定し、ダイアログを開く', async () => {
      await wrapper.setProps({ id: 1 });
      wrapper.vm.openDialog();
      await flushPromises();

      expect(wrapper.vm.folder.name).toBe(state.folders[0].name);
      expect(wrapper.vm.folder.description).toBe(state.folders[0].description);
      expect(wrapper.vm.dialog).toBeTruthy();
    });
  });

  describe('mount後のDOM検証', () => {
    beforeEach(async () => {
      wrapper = mount(FolderSettingDialog, {
        propsData: { projectId: 1 },
        store,
      });

      // openDialogによってDOMが生成される
      wrapper.vm.openDialog();
      await flushPromises();
    });

    describe('登録時、更新時共通', () => {
      it('×ボタンが押下されたとき、ダイアログを閉じる', async () => {
        wrapper.find('#close-button').trigger('click');
        expect(wrapper.vm.dialog).toBeFalsy();
      });

      describe('フォルダ名', () => {
        let input = '';
        beforeEach(async () => {
          input = wrapper.find('#folder-name');
        });

        it('フォルダ名が入力されたとき、文字数をカウントする', async () => {
          const inputName = 'test1';

          input.setValue(inputName);
          expect(wrapper.vm.folder.name).toBe(inputName);

          // 文字数がカウントアップされているかどうか確認する
          const counter = wrapper.findAll('.v-counter').filter(w => w.text() === `${inputName.length} / 30`);
          expect(counter).toBeTruthy();
        });

        it('フォルダ名を未入力にすると必須エラーとなる', async () => {
          expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();

          input.setValue('');
          await flushPromises();

          const errorEl = wrapper.find('.v-messages__message');
          expect(errorEl.text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(wrapper.vm.dialog).toBeTruthy();
        });

        it('フォルダ名に最大文字数以上の値が入力できない', async () => {
          expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();

          const maxLength = 30;
          input.setValue('t'.repeat(maxLength + 1));
          await flushPromises();

          const errorEl = wrapper.find('.v-messages__message');
          expect(errorEl.text()).toBeTruthy();

          wrapper.find('#commit-button').trigger('click');
          await flushPromises();

          expect(wrapper.vm.dialog).toBeTruthy();
        });
      });

      it('説明に最大文字数以上の値を入力すると、最大文字数エラーとなる', async () => {
        expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();

        const textarea = wrapper.find(`#folder-description`);
        textarea.setValue('t'.repeat(constants.MAX_LENGTH_TEXT + 1));
        await flushPromises();

        const errorEl = wrapper.find('.v-messages__message');
        expect(errorEl.text()).toBeTruthy();

        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(wrapper.vm.dialog).toBeTruthy();
      });

      it('キャンセルボタンが押下されたとき、ダイアログを閉じる', async () => {
        wrapper.find('#cancel-button').trigger('click');
        expect(wrapper.vm.dialog).toBeFalsy();
      });
    });

    describe('登録時', () => {
      beforeEach(() => {
        wrapper.find('#folder-name').setValue('test');
        wrapper.find('#folder-description').setValue('description');
      });

      it('submitボタンが押下されたとき、API接続にてエラーが発生しない場合、ダイアログを閉じる', async () => {
        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(wrapper.vm.dialog).toBeFalsy();
      });

      it('submitボタンが押下されたとき、API接続にてエラーが発生した場合、ダイアログを閉じない', async () => {
        mockError = true;

        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(wrapper.vm.dialog).toBeTruthy();
      });
    });

    describe('更新時', () => {
      beforeEach(async () => {
        const id = 1;
        await wrapper.setProps({ id });

        // idを設定してopenDialogメソッドを実行することで更新モードになる
        wrapper.vm.openDialog();
        await flushPromises();
      });

      it('submitボタンが押下されたとき、API接続にてエラーが発生しない場合、ダイアログを閉じる', async () => {
        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(wrapper.vm.dialog).toBeFalsy();
      });

      it('submitボタンが押下されたとき、API接続にてエラーが発生した場合、ダイアログを閉じない', async () => {
        mockError = true;

        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(wrapper.vm.dialog).toBeTruthy();
      });
    });
  });
});
