const maxLengthPassword = 20;
const minLengthPassword = 6;
const maxLengthEmail = 125;

export default {
  maxLengthPassword,
  minLengthPassword,
};

export const emailInfo = {
  computed: {
    emailInfo() {
      return {
        label: 'メールアドレス',
        maxLength: maxLengthEmail,
      };
    },
  },
};

export const passwordInfo = {
  computed: {
    passwordInfo() {
      return {
        label: 'パスワード',
        maxLength: maxLengthPassword,
        minLength: minLengthPassword,
      };
    },
  },
};

export const passwordConfirmationInfo = {
  computed: {
    passwordConfirmationInfo() {
      return {
        label: 'パスワードのご確認',
      };
    },
  },
};

export const nameInfo = {
  computed: {
    nameInfo() {
      return {
        label: 'ユーザー名',
        maxLength: 255,
      };
    },
  },
};
