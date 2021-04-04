<template>
  <div>
    <template>
      <slot :openDialog="openDialog"></slot>
    </template>

    <v-dialog v-model="dialog" width="500" @click:outside="clear">
      <FormDialogCard
        :titleText="titleText"
        :commitBtnText="commitBtnText"
        @cancel-btn-click="clear"
        @commit-btn-click="submit"
      >
        <ValidationProvider v-slot="{ errors }" :name="nameInfo.label" :rules="nameInfo.rules">
          <v-text-field
            v-model="folder.name"
            :counter="nameInfo.maxLength"
            :error-messages="errors"
            :label="nameInfo.label"
            outlined
            :maxlength="nameInfo.maxLength"
            :class="'mx-4 mt-7'"
            id="folder-name"
          ></v-text-field>
        </ValidationProvider>

        <ValidationProvider v-slot="{ errors }" :name="descriptionInfo.label" :rules="descriptionInfo.rules">
          <v-textarea
            v-model="folder.description"
            :label="descriptionInfo.label"
            :error-messages="errors"
            outlined
            :maxlength="descriptionInfo.maxLength"
            :class="'mx-4 mt-3'"
            auto-grow
            id="folder-description"
          ></v-textarea>
        </ValidationProvider>
      </FormDialogCard>
    </v-dialog>
  </div>
</template>

<script>
import FormDialogCard from '@/components/FormDialogCard.vue';
import ResetScroll from '@/mixins/reset-scroll';
import constants from '../consts/constants';

export default {
  components: {
    FormDialogCard,
  },
  mixins: [ResetScroll],
  props: {
    id: {
      type: [Number],
      default: null,
    },
    projectId: {
      type: [Number],
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      folder: { name: '', description: '', lockVersion: '' },
      titleText: 'フォルダ新規作成',
      commitBtnText: '作成',
    };
  },
  computed: {
    nameInfo() {
      return {
        label: 'フォルダ名',
        maxLength: 30,
        rules: `required|max:30`,
      };
    },
    descriptionInfo() {
      return {
        label: '説明',
        maxLength: constants.MAX_LENGTH_TEXT,
        rules: `max:${constants.MAX_LENGTH_TEXT}`,
      };
    },
  },
  methods: {
    submit(isValid) {
      isValid.then(success => {
        if (!success) {
          return;
        }

        const saveFunction = this.id ? this.updateFolder() : this.createFolder();
        saveFunction
          .then(() => {
            this.clear();
          })
          .catch(() => {});
      });
    },
    clear() {
      this.folder.name = '';
      this.folder.description = '';
      this.dialog = false;
    },
    openDialog() {
      // 新規作成と編集時で画面を共有しているため、
      if (this.id) {
        this.titleText = 'フォルダ設定';
        this.commitBtnText = '変更を保存';

        this.$store
          .dispatch('folder/get', { id: this.id, projectId: this.projectId })
          .then(state => {
            this.folder.name = state.name;
            this.folder.description = state.description;
            this.folder.lockVersion = state.lock_version;
            this.dialog = true;
          })
          .catch(() => {
            this.dialog = false;
          });
      } else {
        this.titleText = 'フォルダ新規作成';
        this.commitBtnText = '作成';
        this.dialog = true;
      }
      this.$emit('open-dialog');
    },
    createFolder() {
      return this.$store.dispatch('folder/create', Object.assign(this.folder, { projectId: this.projectId }));
    },
    updateFolder() {
      const { name, description, lockVersion } = this.folder;
      return this.$store.dispatch('folder/update', {
        name,
        description,
        lockVersion,
        id: this.id,
        projectId: this.projectId,
      });
    },
  },
  watch: {
    dialog() {
      // スクロールバーを初期位置に設定する。
      this.resetScroll();
    },
  },
};
</script>

<style scoped lang="scss">
.add-folder {
  justify-content: start;
  opacity: 0.6;
}
</style>
