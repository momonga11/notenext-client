<template>
  <CommonMessagePage :message="errorMessage" titleIcon="mdi-alert-outline"></CommonMessagePage>
</template>

<script>
import CommonMessagePage from '@/components/CommonMessagePage.vue';
import message from '../consts/message';

export default {
  components: {
    CommonMessagePage,
  },
  computed: {
    errorMessage() {
      return message.ERROR_URL_NOT_FOUND;
    },
  },
};
</script>
