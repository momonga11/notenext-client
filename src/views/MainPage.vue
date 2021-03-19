<template>
  <v-app>
    <NavDrawerItem :drawer="drawer" @input="changeDrawer($event)" :projectId="projectId"></NavDrawerItem>
    <HeaderItem @nav-icon-click="drawer = !drawer"></HeaderItem>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import NavDrawerItem from '@/components/NavDrawerItem.vue';
import HeaderItem from '@/components/HeaderItem.vue';
import redirect from '@/mixins/redirect';
import store from '@/store';

export default {
  components: {
    NavDrawerItem,
    HeaderItem,
  },
  mixins: [redirect],
  data() {
    return {
      drawer: null,
    };
  },
  props: {
    projectId: {
      type: [Number],
      required: true,
    },
  },
  methods: {
    // レスポンシブ対応により、NavDrawerItem内におけるドロワーの状態変更イベントを反映させる必要があるため。
    changeDrawer(drawer) {
      this.drawer = drawer;
    },
  },
  beforeRouteEnter(to, from, next) {
    store
      .dispatch('project/getWithAssociation', to.params.projectId)
      .then(() => {
        next();
      })
      .catch(error => {
        next(vm => {
          vm.redirectTop(vm, error.response ? error.response.status : '');
        });
      });
  },
  beforeRouteUpdate(to, from, next) {
    if (Number(to.params.projectId) !== Number(from.params.projectId)) {
      this.$store
        .dispatch('project/getWithAssociation', to.params.projectId)
        .then(() => {
          next();
        })
        .catch(error => {
          this.redirectTop(this, error.response ? error.response.status : '');
          next();
        });
    } else {
      next();
    }
  },
};
</script>

<style lang="scss">
// ナビゲーションドロワー全体にスクロールバーが表示されるのを停止する。
.v-navigation-drawer__content {
  overflow-y: hidden;
}

html {
  overflow: hidden !important;
  scrollbar-width: none;
}

html::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
