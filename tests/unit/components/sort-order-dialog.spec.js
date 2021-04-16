import { mount } from '@vue/test-utils';
import SortOrderDialog from '@/components/SortOrderDialog.vue';
import flushPromises from 'flush-promises';
import {
  sortItemUpdatedAt,
  sortItemCreatedAt,
  sortItemTitle,
  sortOrderValueAsc,
  sortOrderValueDesc,
} from '@/mixins/inputInfo/note-sort-info';

describe('SortOrderDialog.vue', () => {
  const sortItemList = [sortItemUpdatedAt, sortItemCreatedAt, sortItemTitle];
  const sortAscLabel = '昇順';
  const sortDescLabel = '降順';
  const sortOrderList = [
    { label: sortAscLabel, value: sortOrderValueAsc },
    { label: sortDescLabel, value: sortOrderValueDesc },
  ];
  let wrapper;
  const props = {
    titleText: 'test-title',
    sortItem: 'created_at',
    sortOrder: 'asc',
    sortItemList,
    sortOrderList,
  };

  beforeEach(async () => {
    // default設定がないpropsのみ設定する
    wrapper = mount(SortOrderDialog, {
      propsData: props,
    });
    // wrapper.vm.dialog = true;
    // await flushPromises();
  });

  it('renders props.titleText when passed', async () => {
    const titleText = 'test-title-hoge';
    await wrapper.setProps({ titleText });

    wrapper.vm.dialog = true;
    await flushPromises();

    expect(wrapper.props().titleText).toBe(titleText);
    expect(wrapper.find('#title-text').text()).toBe(titleText);
  });

  it('renders props.sortItem when passed And set default check', async () => {
    const sortItem = 'title';
    await wrapper.setProps({ sortItem });
    wrapper.vm.dialog = true;
    await flushPromises();

    expect(wrapper.props().sortItem).toBe(sortItem);
    expect(wrapper.find('input[type=radio]:checked[id^=sort-item]').element.value).toBe(sortItem);
  });

  it('renders props.sortOrder when passed And set default check', async () => {
    const sortOrder = 'desc';
    await wrapper.setProps({ sortOrder });
    wrapper.vm.dialog = true;
    await flushPromises();

    expect(wrapper.props().sortOrder).toBe(sortOrder);
    expect(wrapper.find('input[type=radio]:checked[id^=sort-order]').element.value).toBe(sortOrder);
  });

  it('renders props.sortItemList when passed And render dom', async () => {
    // デフォルトで設定してあるので、sortItemListが画面上に反映されていることを確認する
    wrapper.vm.dialog = true;
    await flushPromises();

    expect(wrapper.props().sortItemList).toBe(sortItemList);
    const elements = wrapper.findAll('input[type=radio][id^=sort-item]').wrappers;
    elements.forEach(e => {
      expect([sortItemUpdatedAt.value, sortItemCreatedAt.value, sortItemTitle.value]).toContain(e.element.value);
    });

    // ラベルが表示されていること
    expect(wrapper.text()).toMatch(sortItemUpdatedAt.label);
    expect(wrapper.text()).toMatch(sortItemCreatedAt.label);
    expect(wrapper.text()).toMatch(sortItemTitle.label);
  });

  it('renders props.sortOrderList when passed And render dom', async () => {
    // デフォルトで設定してあるので、sortOrderListが画面上に反映されていることを確認する
    wrapper.vm.dialog = true;
    await flushPromises();

    expect(wrapper.props().sortOrderList).toBe(sortOrderList);
    const elements = wrapper.findAll('input[type=radio][id^=sort-order]').wrappers;
    elements.forEach(e => {
      expect([sortOrderValueAsc, sortOrderValueDesc]).toContain(e.element.value);
    });

    // ラベルが表示されていること
    expect(wrapper.text()).toMatch(sortAscLabel);
    expect(wrapper.text()).toMatch(sortDescLabel);
  });

  it('commitButton Click', async () => {
    wrapper.vm.dialog = true;
    await flushPromises();

    wrapper.find('#commit-button').trigger('click');
    await flushPromises();

    expect(wrapper.vm.dialog).toBeFalsy();
    expect(wrapper.emitted()['commit-btn-click']).toBeTruthy();
  });

  it('cancel button click', async () => {
    wrapper.vm.dialog = true;
    await flushPromises();

    wrapper.find('#cancel-button').trigger('click');
    await flushPromises();

    expect(wrapper.vm.dialog).toBeFalsy();
  });
});
