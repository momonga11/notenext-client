<template>
  <ValidationProvider v-slot="{ errors }" :name="emailInfo.label" :rules="rule">
    <v-text-field
      v-bind="$attrs"
      :value="value"
      v-on="$listeners"
      :error-messages="errors"
      outlined
      :class="fieldClass"
      type="email"
      :label="emailInfo.label"
    ></v-text-field>
  </ValidationProvider>
</template>

<script>
import { emailInfo } from '@/mixins/inputInfo/auth-info';

export default {
  inheritAttrs: false,
  mixins: [emailInfo],
  props: {
    value: {
      type: String,
    },
    fieldClass: {
      type: String,
      default: '',
    },
  },
  computed: {
    rule() {
      return `required|email|max:${this.emailInfo.maxLength}`;
    },
  },
};
</script>
