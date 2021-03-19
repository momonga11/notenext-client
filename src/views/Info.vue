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
