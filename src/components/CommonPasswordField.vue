<template>
  <ValidationProvider v-slot="{ errors }" :name="name" :rules="passwordRule" :vid="vid">
    <BasePassword
      v-bind="$attrs"
      :value="value"
      v-on="$listeners"
      :minlength="passwordInfo.minLength"
      :maxlength="passwordInfo.maxLength"
      :error-messages="errors"
      outlined
      :class="fieldClass"
    >
    </BasePassword>
  </ValidationProvider>
</template>

<script>
import BasePassword from '@/components/BasePassword.vue';
import { passwordInfo } from '@/mixins/inputInfo/auth-info';

export default {
  inheritAttrs: false,
  components: { BasePassword },
  mixins: [passwordInfo],
  props: {
    value: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    fieldClass: {
      type: String,
      default: '',
    },
    vid: {
      type: String,
      default: '',
    },
  },
  computed: {
    passwordRule() {
      const rule = `required|max:${this.passwordInfo.maxLength}|min:${this.passwordInfo.minLength}`;
      if (this.isConfirmed) {
        return `${rule}|confirmed:confirmation`;
      }
      return rule;
    },
  },
};
</script>
