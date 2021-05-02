<template>
  <div>
    <template>
      <slot :openDialog="openDialog"></slot>
    </template>

    <v-dialog v-model="dialog" :width="500" @click:outside="clear" :fullscreen="$vuetify.breakpoint.mobile">
      <FormDialogCard titleText="パスワード変更" @cancel-btn-click="clear" @commit-btn-click="submit">
        <CommonPasswordField
          :name="currentPasswordInfo.label"
          v-model="auth.currentPassword"
          :label="currentPasswordInfo.label"
          :fieldClass="'mx-4 mt-7'"
          :isShowAppendIcon="false"
          id="current-password-changepassword-dialog"
        ></CommonPasswordField>
        <CommonPasswordField
          :name="passwordNewInfo.label"
          v-model="auth.password"
          :label="passwordNewInfo.label"
          :fieldClass="'mx-4 mt-3'"
          :isShowAppendIcon="false"
          vid="confirmation"
          id="password-changepassword-dialog"
        ></CommonPasswordField>
        <CommonPasswordField
          :name="passwordNewInfo.label"
          v-model="auth.passwordConfirmation"
          :label="passwordNewConfirmationInfo.label"
          :fieldClass="'mx-4 mt-3'"
          :isShowAppendIcon="true"
          :isConfirmed="true"
          id="password-confirm-changepassword-dialog"
        ></CommonPasswordField>
      </FormDialogCard>
    </v-dialog>
  </div>
</template>

<script>
import FormDialogCard from '@/components/FormDialogCard.vue';
import { passwordInfo } from '@/mixins/inputInfo/auth-info';
import CommonPasswordField from '@/components/CommonPasswordField.vue';

export default {
  components: {
    FormDialogCard,
    CommonPasswordField,
  },
  mixins: [passwordInfo],

  data() {
    return {
      dialog: false,
      auth: {
        currentPassword: '',
        password: '',
        passwordConfirmation: '',
      },
    };
  },
  computed: {
    currentPasswordInfo() {
      return {
        label: '現在のパスワード',
      };
    },
    passwordNewInfo() {
      return {
        label: '新しいパスワード',
      };
    },
    passwordNewConfirmationInfo() {
      return {
        label: '新しいパスワードのご確認',
      };
    },
  },
  methods: {
    submit(isValid) {
      isValid.then(success => {
        if (!success) {
          return;
        }

        this.$store
          .dispatch('auth/updateCurrentPassword', this.auth)
          .then(() => {
            this.$emit('success');
            this.clear();
          })
          .catch(() => {});
      });
    },
    clear() {
      this.auth.currentPassword = '';
      this.auth.password = '';
      this.auth.passwordConfirmation = '';
      this.dialog = false;
    },
    openDialog() {
      this.dialog = true;
    },
  },
};
</script>
