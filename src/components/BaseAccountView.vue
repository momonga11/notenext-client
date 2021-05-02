<template>
  <div class="page-body grey lighten-4">
    <main class="ma-3">
      <slot name="header"></slot>
      <v-responsive
        class="my-5 mx-auto main-logo-container d-flex align-center"
        :min-height="$vuetify.breakpoint.mobile ? 50 : 80"
        :max-width="380"
        :min-width="90"
      >
        <v-img :src="require('../assets/logo_green.png')" class="mx-2" />
      </v-responsive>
      <slot></slot>
    </main>
  </div>
</template>

<script>
export default {};
</script>

<style scoped="scss">
.page-body {
  height: 100vh;
  overflow-y: auto;
}

.main-logo-container {
  text-align: center;
}
</style>
