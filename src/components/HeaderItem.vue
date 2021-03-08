<template>
  <v-app-bar app flat color="primary">
    <ErrorMessageItem v-show="hasError" :alert="hasError"></ErrorMessageItem>
    <v-app-bar-nav-icon @click.stop="drawer"></v-app-bar-nav-icon>
    <v-card flat class="d-flex ml-2" width="250px" color="primary">
      <v-tabs
        v-model="activeTab"
        background-color="primary"
        color="success"
        hide-slider
        height="64px"
        grow
        icons-and-text
      >
        <keep-alive>
          <v-tab active-class="tab-selected" key="note" @change="changeNoteTab">
            ノート
            <v-icon>mdi-note-multiple</v-icon></v-tab
          >
        </keep-alive>
        <keep-alive>
          <v-tab active-class="tab-selected" key="task"
            >タスク
            <v-icon>mdi-checkbox-multiple-marked-circle</v-icon>
          </v-tab>
        </keep-alive>
      </v-tabs>
    </v-card>
    <v-spacer></v-spacer>
    <v-menu offset-y v-model="menuValue">
      <template v-slot:activator="{ on, attrs }">
        <v-avatar v-bind="attrs" v-on="on" color="grey lighten-4" size="48">
          <v-img v-if="auth.avatar" :src="auth.avatar" alt=""></v-img>
          <v-img v-else :src="defaultAvatar" alt=""></v-img>
        </v-avatar>
      </template>
      <v-list>
        <v-list-item :to="{ name: 'UserEdit' }">
          <v-list-item-title>ユーザー設定</v-list-item-title>
        </v-list-item>

        <v-list-item @click="signout">
          <v-list-item-title>ログアウト</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
// import UserSettingDialog from '@/components/UserSettingDialog.vue';
import ErrorMessageItem from '@/components/ErrorMessageItem.vue';
import { mapState } from 'vuex';
import defaultAvatar from '@/assets/no_image.png';

const tabkeys = { note: 'note', task: 'task' };

export default {
  components: {
    // UserSettingDialog,
    ErrorMessageItem,
  },
  data() {
    return {
      menuValue: false,
      activeNoteTab: true,
      activeTab: 'note',
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
    changeNoteTab() {
      this.$router.push({ name: 'AllNoteList', params: { projectId: this.$route.params.projectId } });
    },
    signout() {
      this.$store.dispatch('auth/signout').then(() => {
        // TODO: ここ移動しなくてもいい気がする
        // this.$router.push({ name: 'signin' });
      });
    },
  },
  watch: {
    $route(to) {
      if (to.name === 'NoteList') {
        this.activeTab = tabkeys.note;
      } else if (to.name === 'TaskList') {
        this.activeTab = tabkeys.task;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.header {
  width: 100%;
  height: 70px;
  background-color: #4ee097;
  display: flex;
}

.nav {
  flex-grow: 2;
  display: inherit;
  justify-content: space-between;
}

.main-nav {
  margin-left: 5rem;
  display: flex;
  list-style: none;
  -webkit-transition: transform 0.3s ease-in-out;
  transition: transform 0.3s ease-in-out;
}

.not-active-side-ber {
  transform: translateX(80px);
}

.tab-selected {
  background-color: #0aaf5d;
}
</style>
