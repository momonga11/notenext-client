<template>
  <v-row no-gutters class="flex-wrap" style="height: 100%">
    <v-col class="flex-grow-0 flex-shrink-0 grey lighten-4 list" style="width: 370px">
      <v-alert
        v-model="alert"
        v-if="searchQuery"
        dismissible
        dense
        tile
        text
        border="left"
        color="teal darken-1"
        class="mb-2"
        @input="closeSearchedAlert"
        id="searched-alert"
      >
        <div class="d-flex">
          <div class="search-query overflow-text mr-2">{{ `'${searchQuery}'` }}</div>
          <div>{{ 'で検索中' }}</div>
        </div>
      </v-alert>
      <slot name="list" v-bind:searchedAlertHeight="searchedAlertHeight"></slot>
    </v-col>
    <v-col cols="6" class="flex-grow-1 flex-shrink-0" style="min-width: 100px; max-width: 100%">
      <slot name="main"></slot>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    projectId: {
      type: [Number],
      required: true,
    },
    searchQuery: {
      type: [String],
    },
  },
  data() {
    return {
      alert: false,
    };
  },
  computed: {
    searchedAlertHeight() {
      if (!this.searchQuery) {
        return 0;
      }

      return 49;
    },
  },
  methods: {
    closeSearchedAlert(alert) {
      if (!alert) {
        // 検索条件で抽出されていたフォルダを最新化する
        this.$store
          .dispatch('folder/getFolders', {
            projectId: this.projectId,
          })
          .then(() => {
            this.$router.push({
              name: this.$route.name,
            });
          })
          .catch(() => {});
      }
    },
  },
  mounted() {
    // 初回呼び出しの時は、watchが動いていないため、明示的に設定する
    if (this.searchQuery) {
      this.alert = true;

      // 初回呼び出しの時、フォルダを検索条件で抽出する
      this.$store
        .dispatch('folder/getFoldersExistsNote', { projectId: this.projectId, searchQuery: this.searchQuery })
        .catch(() => {});
    }
  },
  watch: {
    searchQuery(value) {
      if (value) {
        this.alert = true;
      }
    },
  },
};
</script>

<style scoped>
.list {
  border: grey solid 1px;
}

.search-query {
  max-width: 225px;
}
</style>
