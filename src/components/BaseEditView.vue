<template>
  <v-card v-bind="$attrs" v-on="$listeners">
    <v-btn text icon :ripple="false" absolute top right class="mt-n3 mr-n3" @click="cancelBtnClick">
      <v-icon>mdi-close-thick</v-icon>
    </v-btn>

    <v-card-title class="green lighten-5">
      {{ titleText }}
    </v-card-title>

    <slot></slot>
  </v-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    titleText: {
      type: String,
      require: true,
    },
    color: {
      type: String,
    },
  },
  methods: {
    cancelBtnClick() {
      this.$emit('cancel-btn-click');
    },
  },
};
</script>

<style></style>
