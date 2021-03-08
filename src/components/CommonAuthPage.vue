<template>
  <BaseAccountView>
    <template v-slot:header>
      <ErrorMessageItem v-show="hasError" :alert="hasError"></ErrorMessageItem>
      <slot name="header"></slot>
    </template>
    <v-card :height="height" width="450" class="mx-auto px-8 text-center">
      <v-card-title class="text-center mb-2">
        <div class="mx-auto">{{ titleText }}</div>
      </v-card-title>
      <BaseForm ref="baseform">
        <slot></slot>
        <BaseButton height="40" :block="true" @click="commitBtnClick">{{ commitButtonText }}</BaseButton>
      </BaseForm>
      <slot name="bottom-items"></slot>
    </v-card>
  </BaseAccountView>
</template>

<script>
import BaseForm from '@/components/BaseForm.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseAccountView from '@/components/BaseAccountView.vue';
import ErrorMessageItem from '@/components/ErrorMessageItem.vue';

export default {
  components: {
    BaseForm,
    BaseButton,
    BaseAccountView,
    ErrorMessageItem,
  },
  props: {
    titleText: {
      type: String,
      require: true,
    },
    height: {
      type: Number,
      default: 450,
    },
    commitButtonText: {
      type: String,
      require: true,
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
  },
};
</script>

<style scoped="scss">
.page-body {
  height: 100%;
}
</style>
