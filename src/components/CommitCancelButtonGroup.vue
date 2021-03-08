<template>
  <div class="mx-auto text-center my-3">
    <BaseButton v-if="isVisbleCancelBtn" :isCancelBtn="true" @click="cancelBtnClick" class="mx-3">{{
      cancelBtnText
    }}</BaseButton>
    <BaseButton v-if="isVisbleCommitBtn" @click="commitBtnClick" class="mx-3" :color="commitBtnColor">
      {{ commitBtnText }}</BaseButton
    >
  </div>
</template>

<script>
import BaseButton from '@/components/BaseButton.vue';

export default {
  components: {
    BaseButton,
  },
  props: {
    isVisbleCommitBtn: {
      type: Boolean,
      default: true,
    },
    isVisbleCancelBtn: {
      type: Boolean,
      default: true,
    },
    commitBtnText: {
      type: String,
      default: '変更を保存',
    },
    cancelBtnText: {
      type: String,
      default: 'キャンセル',
    },
    commitBtnColor: {
      type: String,
      default: '',
    },
  },
  methods: {
    commitBtnClick() {
      this.$emit('commit-btn-click');
    },
    cancelBtnClick() {
      this.$emit('cancel-btn-click');
    },
  },
};
</script>
