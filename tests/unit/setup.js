import Vue from 'vue';
import Vuetify from 'vuetify';
import Vuex from 'vuex';
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate';
import * as originalRules from 'vee-validate/dist/rules';
import 'jest';

Vue.use(Vuetify);
Vue.use(Vuex);
Vue.config.devtools = false;
Vue.config.productionTip = false;

Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

Object.keys(originalRules).forEach(rule => {
  extend(rule, { ...originalRules[rule] });
});

// 不要なエラーを出さないようにする
// ※必要な場合に出力する
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
