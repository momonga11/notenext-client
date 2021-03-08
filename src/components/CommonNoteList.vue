<template>
  <v-row no-gutters class="flex-wrap" style="height: 100%">
    <v-col class="flex-grow-0 flex-shrink-0 grey lighten-4 list" style="width: 370px">
      <slot name="list"></slot>
    </v-col>
    <v-col cols="6" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%">
      <slot name="main"></slot>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
    };
  },
};
</script>

<style scoped>
.list {
  border: grey solid 1px;
}
</style>
