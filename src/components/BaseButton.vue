<template>
  <v-btn
    v-bind="$attrs"
    v-on="$listeners"
    :width="width"
    :color="buttonColor"
    depressed
    class="base-btn--radius pa-3"
    :class="fontWeight"
  >
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  inheritAttrs: false,
  data() {
    return { textColor: 'white--text' };
  },
  props: {
    isCancelBtn: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 150,
    },
    color: {
      type: String,
    },
    fontWeight: {
      type: String,
      default: 'font-weight-bold',
    },
  },
  computed: {
    buttonColor() {
      if (this.color) {
        return this.color;
      }

      if (this.isCancelBtn) {
        return `green lighten-5 green--text`;
      }

      return `accent ${this.textColor}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.base-btn--radius {
  border-radius: 4px;
}
</style>
