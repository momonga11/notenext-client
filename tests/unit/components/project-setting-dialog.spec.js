import { shallowMount, mount } from '@vue/test-utils';
import ProjectSettingDialog from '@/components/ProjectSettingDialog.vue';
import Vuex from 'vuex';
import flushPromises from 'flush-promises';
import constants from '../../../src/consts/constants';
import { ErrorStoreMock, rejectError } from '../modules/error';

describe('ProjectSettingDialog.vue', () => {
  let store;
  let projectStoreMock;
  let wrapper;
  let mockError;

  const state = {
    id: 1,
    name: 'test-name',
    description: 'hogehoge',
    lock_version: 0,
  };

  beforeEach(() => {
    mockError = false;

    // Vuexストアのモックを作成する
    projectStoreMock = {
      namespaced: true,
      state,
      actions: {
        get: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve(state);
          }
          return rejectError(wrapper);
        }),
        update: jest.fn().mockImplementation(() => {
          if (!mockError) {
            return Promise.resolve();
          }
          return rejectError(wrapper);
        }),
      },
    };

    store = new Vuex.Store({
      modules: {
        project: projectStoreMock,
        error: new ErrorStoreMock().getMock(),
      },
    });

    // shallowMountだと子コンポーネントをスタブによって描画しなくなる(高速化)
    wrapper = shallowMount(ProjectSettingDialog, {
      propsData: { projectId: 1 },
      store,
    });
  });

  it('renders props.projectId when passed', async () => {
    // Props
    const projectId = 2;
    await wrapper.setProps({ projectId });

    expect(wrapper.props().projectId).toBe(projectId);
  });

  it('opendialogメソッドにて、API接続に成功した場合、プロジェクト情報を設定し、ダイアログを開く', async () => {
    wrapper.vm.openDialog();
    await flushPromises();

    expect(wrapper.vm.project.name).toBe(state.name);
    expect(wrapper.vm.project.description).toBe(state.description);
    expect(wrapper.vm.dialog).toBeTruthy();
  });
  it('opendialogメソッドにて、API接続に失敗した場合、ダイアログを開かない', async () => {
    mockError = true;

    wrapper.vm.openDialog();
    await flushPromises();

    expect(wrapper.vm.project.name).toBe('');
    expect(wrapper.vm.project.description).toBe('');
    expect(wrapper.vm.dialog).toBeFalsy();
  });

  describe('mount後のDOM検証', () => {
    beforeEach(async () => {
      wrapper = mount(ProjectSettingDialog, {
        propsData: { projectId: 1 },
        store,
      });

      // openDialogによってDOMが生成される
      wrapper.vm.openDialog();
      await flushPromises();
    });

    it('×ボタンが押下されたとき、ダイアログを閉じる', async () => {
      wrapper.find('#close-button').trigger('click');
      expect(wrapper.vm.dialog).toBeFalsy();
    });

    describe('プロジェクト名', () => {
      let input = '';
      beforeEach(async () => {
        input = wrapper.find('#project-name');

        expect(wrapper.find('.v-messages__message').exists()).toBeFalsy();
      });

      it('プロジェクト名が入力されたとき、文字数をカウントする', async () => {
        const inputName = 'test1';

        input.setValue(inputName);
        expect(wrapper.vm.project.name).toBe(inputName);

        // 文字数がカウントアップされているかどうか確認する
        const counter = wrapper.findAll('.v-counter').filter(w => w.text() === `${inputName.length} / 30`);
        expect(counter).toBeTruthy();
      });

      it('プロジェクト名を未入力にすると必須エラーとなる', async () => {
        input.setValue('');
        await flushPromises();

        const errorEl = wrapper.find('.v-messages__message');
        expect(errorEl.text()).toBeTruthy();

        wrapper.find('#commit-button').trigger('click');
        await flushPromises();

        expect(wrapper.vm.dialog).toBeTruthy();
      });

      it('プロジェクト名に最大文字数以上の値が入力できない', async () => {
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

      const textarea = wrapper.find(`#project-description`);
      textarea.setValue('t'.repeat(constants.MAX_LENGTH_TEXT + 1));
      await flushPromises();

      const errorEl = wrapper.find('.v-messages__message');
      expect(errorEl.text()).toBeTruthy();

      wrapper.find('#commit-button').trigger('click');
      await flushPromises();

      expect(wrapper.vm.dialog).toBeTruthy();
    });

    it('キャンセルボタンが押下されたとき、ダイアログを閉じる', async () => {
      wrapper.vm.openDialog();
      await flushPromises();

      wrapper.find('#cancel-button').trigger('click');
      expect(wrapper.vm.dialog).toBeFalsy();
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
