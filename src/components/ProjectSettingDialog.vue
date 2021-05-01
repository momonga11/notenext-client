<template>
  <div>
    <template>
      <slot :openDialog="openDialog"></slot>
    </template>

    <v-dialog v-model="dialog" width="500" @click:outside="clear" :fullscreen="$vuetify.breakpoint.mobile">
      <FormDialogCard titleText="プロジェクト設定" @cancel-btn-click="clear" @commit-btn-click="submit">
        <ValidationProvider v-slot="{ errors }" :name="nameInfo.label" :rules="nameInfo.rules">
          <v-text-field
            v-model="project.name"
            :counter="nameInfo.maxLength"
            :error-messages="errors"
            :label="nameInfo.label"
            outlined
            :maxlength="nameInfo.maxLength"
            :class="'mx-4 mt-7'"
            id="project-name"
          ></v-text-field>
        </ValidationProvider>
        <ValidationProvider v-slot="{ errors }" :name="descriptionInfo.label" :rules="descriptionInfo.rules">
          <v-textarea
            v-model="project.description"
            :label="descriptionInfo.label"
            :error-messages="errors"
            outlined
            :maxlength="descriptionInfo.maxLength"
            :class="'mx-4 mt-3'"
            auto-grow
            id="project-description"
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

  data() {
    return {
      dialog: false,
      project: {
        name: '',
        description: '',
      },
    };
  },
  props: {
    projectId: {
      type: [Number],
      required: true,
    },
  },
  computed: {
    nameInfo() {
      return {
        label: 'プロジェクト名',
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

        this.$store
          .dispatch('project/update', Object.assign(this.project, { id: this.projectId }))
          .then(() => {
            this.dialog = false;
          })
          .catch(() => {});
      });
    },
    clear() {
      this.project.name = '';
      this.project.description = '';
      this.dialog = false;
    },
    openDialog() {
      this.$store
        .dispatch('project/get', this.projectId)
        .then(state => {
          this.project.name = state.name;
          this.project.description = state.description;
          this.dialog = true;
        })
        .catch(() => {
          this.dialog = false;
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
