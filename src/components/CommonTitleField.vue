<template>
  <v-text-field
    v-bind="$attrs"
    :value="value"
    full-width
    dense
    hide-details="auto"
    @input="input($event)"
    @compositionstart="compositionstart"
    @compositionend="compositionend($event)"
  ></v-text-field>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: {
      validator: prop => typeof prop === 'string' || prop === null,
      required: true,
    },
  },
  data() {
    return {
      isComposing: false,
    };
  },
  methods: {
    input(val) {
      if (!this.isComposing) {
        this.$emit('input', val);
      }
    },
    compositionstart() {
      this.isComposing = true;
    },
    compositionend(e) {
      this.isComposing = false;
      this.$emit('input', e.target.value);
    },
  },
};
</script>
