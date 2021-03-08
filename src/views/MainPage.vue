<template>
  <v-app>
    <NavDrawerItem :drawer="drawer" @input="changeDrawer($event)" :projectId="projectId"></NavDrawerItem>
    <HeaderItem @nav-icon-click="drawer = !drawer"></HeaderItem>
    <!-- <LoadingItem v-show="isLoading"></LoadingItem> -->
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import NavDrawerItem from '@/components/NavDrawerItem.vue';
import HeaderItem from '@/components/HeaderItem.vue';
// import LoadingItem from '@/components/LoadingItem.vue';
import redirect from '@/mixins/redirect';

export default {
  components: {
    NavDrawerItem,
    HeaderItem,
    // LoadingItem,
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
  computed: {
    // isLoading() {
    //   return this.$store.state.http.isLoading;
    // },
    // isAuthorized() {
    //   return !!this.$store.state.auth.header.uid;
    // },
    // isForbidden() {
    //   return this.$store.state.error.status === constants.HTTP_STATUS_FORBIDDEN;
    //   // const errorStatus = this.$store.state.error.status;
    //   // return errorStatus !== null && errorStatus === constants.HTTP_STATUS_FORBIDDEN;
    // },
  },
  methods: {
    // レスポンシブ対応により、NavDrawerItem内におけるドロワーの状態変更イベントを反映させる必要があるため。
    changeDrawer(drawer) {
      this.drawer = drawer;
    },
  },
  // watch: {
  //   isAuthorized(value) {
  //     if (!value) {
  //       this.$router.push({ name: 'signin' });
  //     }
  //   },
  // },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.$store.dispatch('project/getWithAssociation', to.params.projectId).catch(error => {
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
