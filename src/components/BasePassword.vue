<template>
  <v-text-field
    v-bind="$attrs"
    :value="value"
    v-on="$listeners"
    :append-icon="appendIcon"
    :type="isPasswordShow ? 'text' : 'password'"
    @click:append="isPasswordShow = !isPasswordShow"
  ></v-text-field>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
    },
    isShowAppendIcon: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isPasswordShow: false,
    };
  },
  computed: {
    appendIcon() {
      if (!this.isShowAppendIcon) {
        return '';
      }
      return this.isPasswordShow ? 'mdi-eye' : 'mdi-eye-off';
    },
  },
};
</script>
