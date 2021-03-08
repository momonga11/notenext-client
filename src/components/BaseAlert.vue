<template>
  <v-alert
    v-bind="$attrs"
    :value="value"
    v-on="$listeners"
    dismissible
    :elevation="2"
    width="100%"
    transition="slide-y-transition"
    class="alert"
  >
    <slot></slot>
  </v-alert>
</template>

<script>
export default {
  inheritAttrs: false,
  props: ['value'],
};
</script>

<style>
.alert {
  position: absolute !important;
}
</style>
