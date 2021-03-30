<template>
  <v-progress-circular :size="70" :width="7" indeterminate class="circular"></v-progress-circular>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.circular {
  width: 100px;
  height: 100px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  z-index: 999999; /* 最前面に出すため */
}
</style>
