<template>
  <div class="page-body grey lighten-4">
    <slot name="header"></slot>
    <div class="my-8 main-logo-container">
      <v-img :src="require('../assets/logo_green.png')" class="my-3 main-logo" width="360px" height="auto" />
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {};
</script>

<style scoped="scss">
.page-body {
  height: 100%;
}

.main-logo {
  display: inline-block;
}

.main-logo-container {
  text-align: center;
  height: 80px;
}
</style>
