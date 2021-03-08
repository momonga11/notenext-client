import VueRouter from 'vue-router';
import constants from '../consts/constants';

const { isNavigationFailure, NavigationFailureType } = VueRouter;

export default {
  methods: {
    redirectTop(vm, status) {
      // 認証エラーの場合は別処理にてログイン画面にリダイレクトさせる
      if (constants.HTTP_STATUS_UNAUTHORIZED === status) {
        return;
      }

      vm.$store.commit('http/setRedirecting', true, { root: true });
      let routerPush = null;

      if (constants.HTTP_STATUS_FORBIDDEN === status) {
        // 権限エラーの場合はエラー画面にリダイレクトさせる
        // TODO: エラー画面作成
        routerPush = vm.$router.replace({ name: 'signin' });
      } else {
        routerPush = vm.$router.replace({ name: 'AllNoteList', params: { projectId: vm.$store.state.project.id } });
      }

      routerPush
        .catch(failure => {
          if (isNavigationFailure(failure, NavigationFailureType.cancelled)) {
            // 複数のAPIにてForbiddenのエラーが返ってきた場合、1回目で遷移先が設定されているため、想定内のエラーとして判定する
            return;
          }
          throw failure;
        })
        .finally(() => {
          vm.$store.commit('http/setRedirecting', false, { root: true });
        });
    },
  },
};
