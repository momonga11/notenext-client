<template>
  <v-app-bar app flat color="primary">
    <ErrorMessageItem v-show="hasError" :alert="hasError"></ErrorMessageItem>
    <v-app-bar-nav-icon @click.stop="drawer"></v-app-bar-nav-icon>
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
  data() {
    return {
      menuValue: false,
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
  },
};
</script>
