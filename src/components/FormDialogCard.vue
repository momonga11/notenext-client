<template>
  <CommonDialogCard
    :color="color"
    :titleText="titleText"
    :isVisbleCancelBtn="isVisbleCancelBtn"
    :isVisbleCommitBtn="isVisbleCommitBtn"
    :commitBtnText="commitBtnText"
    :cancelBtnText="cancelBtnText"
    @commit-btn-click="commitBtnClick"
    @cancel-btn-click="cancelBtnClick"
    v-bind="$attrs"
  >
    <template v-slot:header-items>
      <ErrorMessageItem v-show="hasError" :alert="hasError"></ErrorMessageItem>
      <slot name="header-items"></slot>
    </template>

    <!-- form内のメインコンテンツが渡される想定 -->
    <BaseForm ref="baseform">
      <slot></slot>
    </BaseForm>

    <slot name="outside-of-form"></slot>

    <template v-slot:bottom-items>
      <slot name="bottom-items"></slot>
    </template>
  </CommonDialogCard>
</template>

<script>
import BaseForm from '@/components/BaseForm.vue';
import CommonDialogCard from '@/components/CommonDialogCard.vue';
import ErrorMessageItem from '@/components/ErrorMessageItem.vue';

export default {
  inheritAttrs: false,
  components: {
    BaseForm,
    CommonDialogCard,
    ErrorMessageItem,
  },
  props: {
    titleText: {
      type: String,
      require: true,
    },
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
    color: {
      type: String,
    },
  },
  computed: {
    hasError() {
      return !!this.$store.state.error.message;
    },
  },
  methods: {
    commitBtnClick() {
      const isValid = this.$refs.baseform.submit();
      this.$emit('commit-btn-click', isValid);
    },
    cancelBtnClick() {
      this.$refs.baseform.clear();
      this.$emit('cancel-btn-click');
    },
  },
};
</script>
