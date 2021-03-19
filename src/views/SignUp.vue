<template>
  <CommonAuthPage
    titleText="アカウントを作成"
    commitButtonText="アカウント作成"
    @commit-btn-click="submit"
    :height="465"
  >
    <CommonUserNameField v-model="auth.name" :fieldClass="'mb-2'" id="user-name-signup"></CommonUserNameField>
    <CommonEmailField v-model="auth.email" :fieldClass="'mb-2'" id="email-signup"></CommonEmailField>
    <CommonPasswordField
      :name="passwordInfo.label"
      v-model="auth.password"
      :label="passwordInfo.label"
      :fieldClass="'mb-2'"
      id="password-signup"
    ></CommonPasswordField>
    <template v-slot:bottom-items>
      <BaseLinkButton :to="{ name: 'signin' }" class="mt-5" id="signin-link"
        >すでにアカウントをお持ちの方はこちら</BaseLinkButton
      >
    </template>
  </CommonAuthPage>
</template>

<script>
import CommonAuthPage from '@/components/CommonAuthPage.vue';
import BaseLinkButton from '@/components/BaseLinkButton.vue';
import CommonUserNameField from '@/components/CommonUserNameField.vue';
import CommonEmailField from '@/components/CommonEmailField.vue';
import CommonPasswordField from '@/components/CommonPasswordField.vue';
import { nameInfo, emailInfo, passwordInfo } from '@/mixins/inputInfo/auth-info';
import message from '../consts/message';

export default {
  components: {
    CommonAuthPage,
    BaseLinkButton,
    CommonUserNameField,
    CommonEmailField,
    CommonPasswordField,
  },
  mixins: [nameInfo, emailInfo, passwordInfo],
  data() {
    return {
      auth: {
        name: '',
        email: '',
        password: '',
      },
    };
  },
  methods: {
    submit(isValid) {
      isValid.then(success => {
        if (!success) {
          return;
        }
        // サインアップ処理
        this.$store
          .dispatch('auth/signup', this.auth)
          .then(() => {
            this.$router.push({ name: 'info', params: { message: message.INFO_MAIL_CONFIRMATION } });
          })
          .catch(() => {});
      });
    },
  },
  mounted() {
    this.auth.name = '';
    this.auth.email = '';
    this.auth.password = '';
  },
};
</script>
