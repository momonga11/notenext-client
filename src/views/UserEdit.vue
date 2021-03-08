<template>
  <FormDialogCard
    titleText="ユーザー設定"
    @commit-btn-click="submit"
    @cancel-btn-click="clear"
    :isVisbleCancelBtn="false"
    flat
  >
    <template v-slot:header-items>
      <BaseAlert type="success" v-show="alert" v-model="alert">
        {{ alertMessage }}
      </BaseAlert>
    </template>
    <v-container fluid class="pb-1">
      <v-row class="mb-1" justify="center" no-gutters>
        <v-col lg="2" md="3">
          <v-card class="pa-4" flat tile>
            <v-card-actions class="justify-center">
              <v-menu offset-y v-model="isMenuOpen">
                <template v-slot:activator="{ on, attrs }">
                  <v-avatar v-bind="attrs" v-on="on" size="164">
                    <v-img v-if="isUploadedImage" :src="auth.avatar.data" alt=""></v-img>
                    <v-img v-else :src="defaultAvatar" alt=""></v-img>
                  </v-avatar>
                </template>
                <v-list dense>
                  <v-list-item @click="selectFile">
                    <v-list-item-title>画像アップロード</v-list-item-title>
                    <ValidationProvider v-slot="{ validate }" name="画像ファイル" :rules="avatarValidateRule">
                      <input
                        type="file"
                        id="file_upload"
                        class="d-none"
                        ref="file"
                        accept="image/*"
                        capture="camera"
                        @change="changeImage($event, validate)"
                      />
                    </ValidationProvider>
                  </v-list-item>

                  <template v-if="isUploadedImage">
                    <v-list-item @click="resetImage">
                      <v-list-item-title>削除</v-list-item-title>
                    </v-list-item>
                  </template>

                  <v-list-item @click="isMenuOpen = !isMenuOpen">
                    <v-list-item-title>キャンセル</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-actions>
            <div class="error--text text-caption text-center">{{ avatarErrorMessage }}</div>
          </v-card>
        </v-col>
        <v-col lg="3" md="3">
          <v-card class="pa-2" flat tile max-height="300">
            <CommonUserNameField v-model="auth.name" :fieldClass="'mx-4 mt-5'"></CommonUserNameField>
            <CommonEmailField v-model="auth.email" :fieldClass="'mx-4 mt-5'"></CommonEmailField>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <template v-slot:outside-of-form>
      <v-container fluid class="pt-1 mb-1">
        <v-row justify="center" no-gutters>
          <v-col lg="2"></v-col>
          <v-col lg="3">
            <v-card class="pl-2" flat tile>
              <div class="pl-4">
                <ChangePasswordDialog v-slot="{ openDialog }" @success="showInfoChangedPassword">
                  <BaseButton :width="200" color="green lighten-5 green--text" @click.stop="openDialog"
                    >パスワードを変更する
                  </BaseButton>
                </ChangePasswordDialog>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
    <template v-slot:bottom-items>
      <v-card flat outlined class="mt-16 mx-auto px-4 pt-1 pb-5 grey lighten-4" max-width="600">
        <v-card-title class="font-weight-bold">アカウント削除</v-card-title>
        <v-row justify="space-between" no-gutters>
          <v-col cols="7">
            <div>{{ textDeleteAccountButtonInfo }}</div>
          </v-col>
          <v-col cols="4">
            <v-card-actions class="justify-center">
              <ConfirmDeleteDialog
                titleText="アカウント削除確認"
                :width="600"
                commitBtnText="アカウント削除"
                commitBtnColor="red darken-1 white--text"
                @commit="deleteAccount"
              >
                <template v-slot:default="{ openDialog }">
                  <BaseButton color="red darken-1 white--text" @click.stop="openDialog">アカウントを削除</BaseButton>
                </template>
                <template v-slot:message>
                  <v-card-text>
                    {{ textDeleteAccount.main }}
                    <div class="my-4 red--text font-weight-bold">
                      <span>{{ textDeleteAccount.sub1 }}</span>
                      <br />
                      <span>{{ textDeleteAccount.sub2 }}</span>
                      <br />
                    </div>
                    <div class="red--text">{{ textDeleteAccount.sub3 }}</div>
                    <div class="mt-3">{{ textDeleteAccount.sub4 }}</div>
                  </v-card-text>
                </template>
              </ConfirmDeleteDialog>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </FormDialogCard>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue';
import BaseAlert from '@/components/BaseAlert.vue';
import FormDialogCard from '@/components/FormDialogCard.vue';
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import CommonEmailField from '@/components/CommonEmailField.vue';
import CommonUserNameField from '@/components/CommonUserNameField.vue';
import { emailInfo, nameInfo } from '@/mixins/inputInfo/auth-info';
import defaultAvatar from '@/assets/no_image.png';
import message from '../consts/message';
import constants from '../consts/constants';

export default {
  components: {
    FormDialogCard,
    BaseButton,
    BaseAlert,
    ChangePasswordDialog,
    ConfirmDeleteDialog,
    CommonEmailField,
    CommonUserNameField,
  },
  mixins: [emailInfo, nameInfo],
  data() {
    return {
      panel: false,
      isMenuOpen: false,
      alert: false,
      auth: {
        name: '',
        email: '',
        avatar: { data: '', filename: '' },
      },
      dialog: false,
      alertMessage: '',
      avatarErrorMessage: '',
    };
  },
  computed: {
    isUploadedImage() {
      return this.auth.avatar.data;
    },
    textDeleteAccount() {
      return {
        main: message.TEXT_DELETE_ACCOUNT,
        sub1: message.TEXT_DELETE_ACCOUNT_SUB1,
        sub2: message.TEXT_DELETE_ACCOUNT_SUB2,
        sub3: message.TEXT_DELETE_ACCOUNT_SUB3,
        sub4: message.TEXT_DELETE_ACCOUNT_SUB4,
      };
    },
    textDeleteAccountButtonInfo() {
      return message.TEXT_DELETE_ACCOUNT_BUTTON_INFO;
    },
    defaultAvatar() {
      return defaultAvatar;
    },
    hasError() {
      return !!this.$store.state.error.message;
    },
    avatarValidateRule() {
      return `image|size:${constants.MAX_SIZE_KB_UPLOAD_IMAGE_FILE}`;
    },
  },
  methods: {
    submit(isValid) {
      isValid.then(success => {
        if (!success) {
          return;
        }

        const { name, email } = this.auth;
        const isChangedEmail = email !== this.$store.state.auth.email;
        this.$store.dispatch('auth/update', { name, email }).then(() => {
          // メールアドレスが変わっていたら、違うメッセージを出す
          if (isChangedEmail) {
            this.showInfoChangedEmail();
          } else {
            this.showInfoSavedAuth();
          }
        });
      });
    },
    clear() {
      this.$router.push({ name: 'AllNoteList', params: { projectId: this.$store.state.project.id } });
    },
    deleteAccount() {
      this.$store.dispatch('project/delete').then(() => {
        this.$store.dispatch('auth/delete').then(() => {
          this.$router.replace({ name: 'info', params: { message: message.INFO_SUCCESS_DELETE_ACCOUNT } });
        });
      });
    },
    selectFile() {
      this.$refs.file.click();
    },
    changeImage(e, validate) {
      const { files } = e.target;

      // // Validate 画像サイズの検証(最大8MBとする)
      validate(files[0]).then(validateResult => {
        const [error] = validateResult.errors;
        this.avatarErrorMessage = error;
        if (validateResult.valid) {
          this.createImage(files[0]);
        }
      });
    },
    createImage(file) {
      const reader = new FileReader();
      reader.onload = e => {
        this.auth.avatar.data = e.target.result;
        this.auth.avatar.filename = file.name;
        // API連携
        this.$store
          .dispatch('auth/update', { avatar: this.auth.avatar })
          .then(() => {
            this.showInfoSavedAvatar();
          })
          .catch(() => {
            this.resetFileValue();
            this.auth.avatar.filename = '';
            this.auth.avatar.data = this.$store.state.auth.avatar;
          });
      };
      reader.readAsDataURL(file);
    },
    resetImage() {
      // API連携
      this.$store.dispatch('auth/deleteAvatar', this.auth.avatar.data).then(() => {
        this.resetFileValue();
        this.auth.avatar.filename = '';
        this.auth.avatar.data = '';
        this.avatarErrorMessage = '';

        this.showInfoDeleteAvatar();
      });
    },
    resetFileValue() {
      const { file } = this.$refs;
      if (file) {
        file.value = '';
      }
    },
    showInfoChangedPassword() {
      this.showAlert(message.INFO_SUCCESS_CHANGE_PASSWORD);
    },
    showInfoSavedAuth() {
      this.showAlert(message.INFO_SUCCESS_SAVED_AUTH);
    },
    showInfoSavedAvatar() {
      this.showAlert(message.INFO_SUCCESS_SAVED_AVATAR);
    },
    showInfoDeleteAvatar() {
      this.showAlert(message.INFO_SUCCESS_DELETED_AVATAR);
    },
    showInfoChangedEmail() {
      this.showAlert(message.INFO_SUCCESS_CHANGE_EMIL);
    },
    showAlert(alertMessage) {
      this.alert = false;
      this.alertMessage = alertMessage;
      this.alert = true;
    },
  },
  mounted() {
    this.alert = false;
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch('auth/get').then(data => {
        vm.auth.name = data.name;
        vm.auth.email = data.email;
        vm.auth.avatar.data = data.avatar;
      });
    });
  },
  watch: {
    hasError(value) {
      if (value) {
        this.alert = !value;
      }
    },
  },
};
</script>
