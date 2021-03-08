import Vue from 'vue';
import { ValidationObserver, ValidationProvider, setInteractionMode, extend, localize } from 'vee-validate';
import { required, image, size, confirmed, max, min, email } from 'vee-validate/dist/rules';

Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

setInteractionMode('eager');

extend('required', {
  ...required,
  message: '{_field_}を入力してください。',
});

extend('image', {
  ...image,
  message: 'jpegまたはpng形式のファイルを選択してください。',
});
extend('size', {
  ...size,
  message: (fieldName, placeholders) => {
    return `画像サイズは${placeholders.size / 1024}MB以下にしてください。`;
  },
  params: ['size'],
});

extend('confirmed', {
  ...confirmed,
  message: '{_field_}が一致しません。',
});

extend('max', {
  ...max,
  message: `{_field_}は{length}文字以下にしてください。`,
  params: ['length'],
});

extend('min', {
  ...min,
  message: `{_field_}は{length}文字以上にしてください。`,
  params: ['length'],
});

extend('email', {
  ...email,
  message: '{_field_}の形式が正しくありません。',
});

// Activate the Arabic locale.
localize('ja');
