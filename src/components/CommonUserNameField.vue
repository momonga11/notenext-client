<template>
  <ValidationProvider v-slot="{ errors }" :name="nameInfo.label" :rules="rule">
    <v-text-field
      v-bind="$attrs"
      :value="value"
      v-on="$listeners"
      :error-messages="errors"
      outlined
      :class="fieldClass"
      :label="nameInfo.label"
      :maxlength="nameInfo.maxLength"
    ></v-text-field>
  </ValidationProvider>
</template>

<script>
import { nameInfo } from '@/mixins/inputInfo/auth-info';

export default {
  inheritAttrs: false,
  mixins: [nameInfo],
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
      return `required|max:${this.nameInfo.maxLength}`;
    },
  },
};
</script>
