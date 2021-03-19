import { mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import Info from '@/views/Info.vue';
import flushPromises from 'flush-promises';
import routes from '../modules/routes';

describe('Info.vue', () => {
  let wrapper;
  let vuetify;
  const localVue = createLocalVue();
  localVue.use(VueRouter);

  beforeEach(async () => {
    const router = new VueRouter({
      routes,
    });
    router.push({ name: 'info' });

    vuetify = new Vuetify();
    wrapper = mount(Info, {
      localVue,
      router,
      vuetify,
    });

    await flushPromises();
  });

  it('renders props.message when passed', async () => {
    const message = 'test-message';
    await wrapper.setProps({ message });

    expect(wrapper.props().message).toBe(message);
    expect(wrapper.find('#message').text()).toBe(message);
  });

  it('renders props.width when passed', async () => {
    const width = 600;
    await wrapper.setProps({ width });

    expect(wrapper.props().width).toBe(width);
    expect(wrapper.find('.v-card').element.style.width.includes(`${width}px`)).toBeTruthy();
  });

  describe('画面遷移', () => {
    it('message parameter がない場合、ログイン画面に遷移する', async () => {
      Info.beforeRouteEnter(wrapper.vm, undefined, c => c(wrapper.vm));

      expect(wrapper.vm.$route.name).toBe('signin');
    });

    it('message parameter がある場合、ログイン画面に遷移しない', async () => {
      await wrapper.setProps({ message: 'test-message' });
      Info.beforeRouteEnter(wrapper.vm, undefined, c => c(wrapper.vm));

      expect(wrapper.vm.$route.name).toBe('info');
    });
  });

  it('redirect signinView', () => {
    wrapper.find('#signin').trigger('click');
    expect(wrapper.vm.$route.name).toBe('signin');
  });
});
