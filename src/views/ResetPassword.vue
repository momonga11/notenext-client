<template>
  <CommonAuthPage
    titleText="パスワードを忘れた場合"
    commitButtonText="メール送信"
    @commit-btn-click="submit"
    :height="340"
  >
    <v-card-subtitle class="pt-0 pb-5"
      >登録されているメールアドレスを入力してください。<br />パスワードリセットメールを送信します。</v-card-subtitle
    >
    <CommonEmailField v-model="auth.email" :fieldClass="'mb-2'" id="email-resetPassword"></CommonEmailField>
    <template v-slot:bottom-items>
      <BaseLinkButton :to="{ name: 'signin' }" class="mt-5" id="signin-link">ログイン画面に戻る</BaseLinkButton>
    </template>
  </CommonAuthPage>
</template>

<script>
import CommonAuthPage from '@/components/CommonAuthPage.vue';
import { emailInfo } from '@/mixins/inputInfo/auth-info';
import BaseLinkButton from '@/components/BaseLinkButton.vue';
import CommonEmailField from '@/components/CommonEmailField.vue';
import message from '../consts/message';

export default {
  components: {
    CommonAuthPage,
    BaseLinkButton,
    CommonEmailField,
  },
  mixins: [emailInfo],
  data() {
    return {
      auth: {
        email: '',
      },
    };
  },
  methods: {
    submit(isValid) {
      isValid.then(success => {
        if (!success) {
          return;
        }

        this.$store
          .dispatch('auth/resetPassword', this.auth.email)
          .then(() => {
            this.$router.replace({ name: 'info', params: { message: message.INFO_SEND_RESET_PASSWORD_MAIL } });
          })
          .catch(() => {});
      });
    },
  },
};
</script>

<style></style>
