<template>
  <CommonAuthPage titleText="ログイン" commitButtonText="ログイン" @commit-btn-click="submit">
    <template v-slot:header>
      <BaseAlert type="success" v-show="confirmedSuccess" v-model="alert" id="alert">
        {{ confirmedSuccessMessage }}
      </BaseAlert>
    </template>
    <CommonEmailField v-model="auth.email" :fieldClass="'mb-2'" id="email-signin"></CommonEmailField>
    <ValidationProvider v-slot="{ errors }" :name="passwordInfo.label" rules="required">
      <BasePassword
        v-model="auth.password"
        :error-messages="errors"
        :label="passwordInfo.label"
        outlined
        :class="'mb-2'"
        id="password-signin"
      ></BasePassword>
    </ValidationProvider>
    <template v-slot:bottom-items>
      <v-row no-gutters>
        <v-col class="d-flex align-center link-button">
          <BaseLinkButton :to="{ name: 'resetPassword' }" id="reset-password-link"
            >パスワードをお忘れですか？</BaseLinkButton
          >
          <span class="mt-2 blue--text text--darken-1" v-if="!$vuetify.breakpoint.xsOnly">/</span>
        </v-col>
        <v-col class="link-button">
          <BaseLinkButton :to="{ name: 'signup' }" id="signup-link">アカウント作成</BaseLinkButton>
        </v-col>
      </v-row>
      <v-divider class="my-3"></v-divider>
      <BaseButton
        height="40"
        :block="true"
        color="light-blue darken-1 white--text"
        @click="loginSampleUser"
        id="sample-login-button"
        >サンプルログイン</BaseButton
      >
    </template>
  </CommonAuthPage>
</template>

<script>
import CommonAuthPage from '@/components/CommonAuthPage.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseLinkButton from '@/components/BaseLinkButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import BasePassword from '@/components/BasePassword.vue';
import CommonEmailField from '@/components/CommonEmailField.vue';
import { emailInfo, passwordInfo } from '@/mixins/inputInfo/auth-info';
import message from '../consts/message';

export default {
  components: {
    CommonAuthPage,
    BaseButton,
    BaseLinkButton,
    BaseAlert,
    CommonEmailField,
    BasePassword,
  },
  mixins: [emailInfo, passwordInfo],
  data() {
    return {
      auth: {
        email: '',
        password: '',
      },
      alert: true,
    };
  },
  computed: {
    confirmedSuccess() {
      return this.$route.query.account_confirmation_success === 'true';
    },
    confirmedSuccessMessage() {
      return message.ACCOUNT_CONFIRMATION_TRUE;
    },
  },
  methods: {
    submit(isValid) {
      isValid.then(success => {
        if (!success) {
          return;
        }

        // アラートを閉じる
        this.alert = false;

        // ログイン処理
        this.$store
          .dispatch('auth/signin', this.auth)
          .then(() => {
            this.redirectMainPage();
          })
          .catch(() => {});
      });
    },
    loginSampleUser() {
      // アラートを閉じる
      this.alert = false;

      // サンプルログイン処理
      this.$store
        .dispatch('auth/signin_sample')
        .then(() => {
          this.redirectMainPage();
        })
        .catch(() => {});
    },
    redirectMainPage() {
      // ログインに成功した場合、所属するプロジェクトを取得する
      this.$store
        .dispatch('project/getProjects')
        .then(response => {
          if (response.length) {
            // 1ユーザー1プロジェクトのため1番目からidを取得し、メイン画面に遷移する
            this.$router.push({ name: 'AllNoteList', params: { projectId: response[0].id } });
          } else {
            // 取得できなかった場合は初期プロジェクトを作成する
            this.$store
              .dispatch('project/create')
              .then(project => {
                this.$router.push({ name: 'AllNoteList', params: { projectId: project.id } });
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    },
  },
  mounted() {
    this.auth.email = '';
    this.auth.password = '';
  },
};
</script>

<style lang="scss" scoped>
.link-button {
  text-align: left;
}
</style>
