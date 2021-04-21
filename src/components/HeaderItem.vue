<template>
  <v-app-bar app flat color="primary">
    <ErrorMessageItem v-show="hasError" :alert="hasError"></ErrorMessageItem>
    <v-app-bar-nav-icon @click.stop="drawer"></v-app-bar-nav-icon>
    <v-card width="292px" min-width="100px" flat class="mx-3" id="search-notes-container">
      <v-text-field
        solo
        flat
        hide-details
        append-icon="mdi-magnify"
        single-line
        outlined
        dense
        height="42px"
        placeholder="ノート検索"
        id="search-notes"
        v-model="searchNoteString"
        @click:append="searchNote"
        @keypress.enter.exact="searchNote"
      ></v-text-field>
    </v-card>
    <v-spacer></v-spacer>
    <v-menu offset-y v-model="menuValue">
      <template v-slot:activator="{ on, attrs }">
        <v-avatar v-bind="attrs" v-on="on" color="grey lighten-4" size="48" id="avatar-header">
          <v-img v-if="auth.avatar" :src="auth.avatar" alt=""></v-img>
          <v-img v-else :src="defaultAvatar" alt=""></v-img>
        </v-avatar>
      </template>
      <v-list>
        <v-list-item :to="{ name: 'UserEdit' }" id="useredit-header">
          <v-list-item-title>ユーザー設定</v-list-item-title>
        </v-list-item>

        <v-list-item @click="signout" id="signout-header">
          <v-list-item-title>ログアウト</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import ErrorMessageItem from '@/components/ErrorMessageItem.vue';
import { mapState } from 'vuex';
import defaultAvatar from '@/assets/no_image.png';

export default {
  components: {
    ErrorMessageItem,
  },
  props: {
    searchQuery: {
      type: [String],
    },
  },
  data() {
    return {
      menuValue: false,
      searchNoteString: '',
    };
  },
  computed: {
    ...mapState({
      auth: state => state.auth,
    }),
    hasError() {
      return !!this.$store.state.error.message;
    },
    defaultAvatar() {
      return defaultAvatar;
    },
  },
  methods: {
    drawer() {
      this.$emit('nav-icon-click');
    },
    changeMenuValue() {
      this.menuValue = !this.menuValue;
    },
    signout() {
      this.$store
        .dispatch('auth/signout')
        .then(() => {})
        .catch(() => {});
    },
    searchNote() {
      if (this.$route.query.search === this.searchNoteString) {
        // query: searchが同一の場合、URLのpathがFromとToで同一となるため、VueRouterの使用上、画面遷移できない。
        // 検索APIの実行は遷移先のコンポーネントにまとめたいので、リロードすることとする。
        this.$router.go({ path: this.$router.currentRoute.path, force: true });

        return;
      }

      this.$router.push({
        name: 'AllNoteList',
        query: { search: this.searchNoteString },
      });
    },
  },
  mounted() {
    if (this.searchQuery) {
      this.searchNoteString = this.searchQuery;
    }
  },
};
</script>
