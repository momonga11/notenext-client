import { mount } from '@vue/test-utils';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import flushPromises from 'flush-promises';
import Vuetify from 'vuetify';

describe('ConfirmDeleteDialog.vue', () => {
  let wrapper;
  let vuetify;
  const props = {
    titleText: 'test-title',
    message: 'test-message',
  };

  beforeEach(async () => {
    vuetify = new Vuetify();

    // default設定がないpropsのみ設定する
    wrapper = mount(ConfirmDeleteDialog, {
      propsData: props,
      vuetify,
    });

    // mobileモードは別途テストする
    wrapper.vm.$vuetify.breakpoint.mobile = false;

    wrapper.vm.openDialog();
    await flushPromises();
  });

  it('renders props.titleText when passed', async () => {
    const titleText = 'test-title-hoge';
    await wrapper.setProps({ titleText });

    expect(wrapper.props().titleText).toBe(titleText);
    expect(wrapper.find('#title-text').text()).toBe(titleText);
  });

  it('renders props.message when passed', async () => {
    const message = 'test-message-hoge';
    await wrapper.setProps({ message });

    expect(wrapper.props().message).toBe(message);
    expect(wrapper.find('#message').text()).toBe(message);
  });

  it('renders props.width when passed', async () => {
    const width = 600;
    await wrapper.setProps({ width });

    expect(wrapper.props().width).toBe(width);
    expect(wrapper.find('.v-dialog').element.style.width.includes(`${width}px`)).toBeTruthy();
  });

  it('renders props.commitBtnText when passed', async () => {
    const commitBtnText = 'test-commit-button';
    await wrapper.setProps({ commitBtnText });

    expect(wrapper.props().commitBtnText).toBe(commitBtnText);
    expect(wrapper.find('#commit-button').text()).toBe(commitBtnText);
  });

  it('renders props.commitBtnColor when passed', async () => {
    const commitBtnColor = 'rgb(0, 0, 128)';

    await wrapper.setProps({ commitBtnColor });
    expect(wrapper.props().commitBtnColor).toBe(commitBtnColor);
    expect(wrapper.find('#commit-button').element.style['background-color']).toBe(commitBtnColor);
  });

  it('openDialog and emit', async () => {
    expect(wrapper.vm.dialog).toBeTruthy();
    expect(wrapper.emitted()['open-dialog']).toBeTruthy();
  });

  it('commitButton Click', async () => {
    wrapper.find('#commit-button').trigger('click');
    await flushPromises();

    expect(wrapper.vm.dialog).toBeFalsy();
    expect(wrapper.emitted().commit).toBeTruthy();
  });

  it('cancel button click', async () => {
    wrapper.find('#cancel-button').trigger('click');
    await flushPromises();

    expect(wrapper.vm.dialog).toBeFalsy();
  });

  describe('レスポンシブ対応(mobile時)', () => {
    beforeEach(async () => {
      wrapper.vm.$vuetify.breakpoint.mobile = true;
      await flushPromises();
    });

    it('ダイヤログがフルスクリーンになること', () => {
      expect(wrapper.find('.v-dialog--fullscreen').exists()).toBeTruthy();
    });
  });
});
