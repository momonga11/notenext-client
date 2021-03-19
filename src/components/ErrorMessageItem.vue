<template>
  <BaseAlert type="error" class="alert" :value="alert" @input="closeAlert" id="error-alert">
    {{ errorMessage }}
  </BaseAlert>
</template>

<script>
import BaseAlert from '@/components/BaseAlert.vue';

export default {
  components: {
    BaseAlert,
  },
  props: {
    alert: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    errorMessage() {
      const { status, message } = this.$store.state.error;
      return `${status} : ${message}`;
    },
  },
  methods: {
    closeAlert() {
      this.$store.dispatch('error/clearError');
    },
  },
};
</script>

<style>
.alert {
  position: absolute !important;
  top: 1px;
  left: 0;
  z-index: 200;
}
</style>
