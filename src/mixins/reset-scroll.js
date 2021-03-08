export default {
  methods: {
    resetScroll() {
      // スクロールバーを初期位置に設定する。
      const elements = document.getElementsByClassName('v-dialog--active');
      if (!elements || !elements.length) {
        return;
      }
      elements[0].scrollTop = 0;
    },
  },
};
