<template>
  <div>
    <LoadingItem v-show="isLoading"></LoadingItem>
    <router-view></router-view>
  </div>
</template>

<script>
import LoadingItem from '@/components/LoadingItem.vue';

export default {
  components: {
    LoadingItem,
  },
  computed: {
    isLoading() {
      return this.$store.state.http.isLoading;
    },
    isAuthorized() {
      return !!this.$store.state.auth.header.uid;
    },
  },
  watch: {
    isAuthorized(value) {
      if (!value) {
        this.$router.push({ name: 'signin' });
      }
    },
  },
};
</script>
