<template>
  <CommonAuthPage titleText="パスワードリセット" commitButtonText="変更する" @commit-btn-click="submit" :height="370">
    <v-card-subtitle class="pt-0 pb-5">新しいパスワードを設定してください。</v-card-subtitle>
    <CommonPasswordField
      :name="passwordInfo.label"
      v-model="auth.password"
      :label="passwordInfo.label"
      :fieldClass="'mb-2'"
      :isShowAppendIcon="false"
      vid="confirmation"
    ></CommonPasswordField>
    <CommonPasswordField
      :name="passwordInfo.label"
      v-model="auth.passwordConfirmation"
      :label="passwordConfirmationInfo.label"
      :fieldClass="'mb-2'"
      :isConfirmed="true"
    ></CommonPasswordField>
  </CommonAuthPage>
</template>

<script>
import CommonAuthPage from '@/components/CommonAuthPage.vue';
import { passwordInfo, passwordConfirmationInfo } from '@/mixins/inputInfo/auth-info';
import CommonPasswordField from '@/components/CommonPasswordField.vue';
import message from '@/consts/message';

const hasAuthQuery = route => {
  return route.query.client && route.query.expiry && route.query.uid && route.query['access-token'];
};

export default {
  components: {
    CommonAuthPage,
    CommonPasswordField,
  },
  mixins: [passwordInfo, passwordConfirmationInfo],
  data() {
    return {
      auth: {
        password: '',
        passwordConfirmation: '',
      },
    };
  },
  methods: {
    submit(isValid) {
      isValid.then(success => {
        if (!success) {
          return;
        }

        const authHeader = {
          header: {
            client: this.$route.query.client,
            expiry: this.$route.query.expiry,
            uid: this.$route.query.uid,
            accessToken: this.$route.query['access-token'],
          },
        };
        this.$store.dispatch('auth/updatePassword', Object.assign(this.auth, authHeader)).then(() => {
          this.$router.replace({ name: 'info', params: { message: message.INFO_SUCCESS_RESET_PASSWORD } });
        });
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!hasAuthQuery(to)) {
        vm.$router.replace({ name: 'signin' });
      }
    });
  },
};
</script>

<style></style>
