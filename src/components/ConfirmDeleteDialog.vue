<template>
  <div>
    <template>
      <slot :openDialog="openDialog"></slot>
    </template>

    <v-dialog v-model="dialog" :width="width" @click:outside="cancelBtnClick" :fullscreen="$vuetify.breakpoint.mobile">
      <CommonDialogCard
        :titleText="titleText"
        :commitBtnText="commitBtnText"
        :commitBtnColor="commitBtnColor"
        @cancel-btn-click="cancelBtnClick"
        @commit-btn-click="commitBtnClick"
      >
        <v-container class="message">
          <template v-if="message">
            <v-card-text id="message">{{ message }}</v-card-text>
          </template>
          <template v-else>
            <slot name="message"></slot>
          </template>
        </v-container>
      </CommonDialogCard>
    </v-dialog>
  </div>
</template>

<script>
import CommonDialogCard from '@/components/CommonDialogCard.vue';

export default {
  components: {
    CommonDialogCard,
  },
  props: {
    titleText: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 400,
    },
    commitBtnText: {
      type: String,
      default: 'OK',
    },
    commitBtnColor: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    close() {
      this.dialog = false;
    },
    commitBtnClick() {
      this.$emit('commit');
      this.close();
    },
    cancelBtnClick() {
      this.close();
    },
    openDialog() {
      this.dialog = true;
    },
  },
  watch: {
    dialog(isOpen) {
      if (isOpen) {
        this.$emit('open-dialog');
      }
    },
  },
};
</script>

<style scoped="scss">
.message {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
