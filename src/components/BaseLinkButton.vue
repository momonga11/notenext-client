<template>
  <v-hover v-slot:default="{ hover }">
    <v-btn
      v-bind="$attrs"
      text
      :ripple="false"
      color="blue darken-1"
      class="mt-2 font-weight-bold"
      plain
      :class="{ 'text-decoration-underline': hover }"
      :block="true"
    >
      <slot></slot>
    </v-btn>
  </v-hover>
</template>

<script>
export default {
  inheritAttrs: false,
};
</script>
