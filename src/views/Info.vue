<template>
  <CommonMessagePage :message="message" :width="width"></CommonMessagePage>
</template>

<script>
import CommonMessagePage from '@/components/CommonMessagePage.vue';

export default {
  components: {
    CommonMessagePage,
  },
  props: {
    message: {
      type: String,
      default: '',
    },
    width: {
      type: Number,
      default: 900,
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (vm.message === '') {
        vm.$router.replace({ name: 'signin' });
      }
    });
  },
};
</script>

<style scoped="scss">
.container {
  text-align: center;
}

.title-message {
  text-align: left;
}

.message {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
