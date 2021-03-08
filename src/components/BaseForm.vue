<template>
  <ValidationObserver ref="observer">
    <form>
      <slot :submit="submit" :clear="clear"></slot>
    </form>
  </ValidationObserver>
</template>

<script>
export default {
  methods: {
    submit() {
      return this.$refs.observer.validate().then(success => {
        if (!success) {
          return success;
        }

        // 検証が成功の場合はリセットする。
        this.$refs.observer.reset();
        return success;
      });
    },
    clear() {
      this.$refs.observer.reset();
    },
  },
};
</script>
