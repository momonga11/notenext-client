<template>
  <v-row no-gutters class="flex-wrap" style="height: 100%">
    <v-col class="grey lighten-4 list" :class="classListWidth" v-show="showList">
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
    <v-col cols="7" class="flex-grow-1 flex-shrink-0" style="max-width: 100%" v-show="showMain">
      <NoSelectNote v-show="notSelectedNote" id="noselectnote"></NoSelectNote>
      <slot name="main" v-show="!notSelectedNote"></slot>
    </v-col>
  </v-row>
</template>

<script>
import NoSelectNote from '@/components/NoSelectNote.vue';

export default {
  components: {
    NoSelectNote,
  },
  props: {
    projectId: {
      type: [Number],
      required: true,
    },
    searchQuery: {
      type: [String],
    },
    notSelectedNote: {
      type: [Boolean],
      required: true,
    },
  },
  data() {
    return {
      alert: false,
      showList: true,
      showMain: true,
    };
  },
  computed: {
    searchedAlertHeight() {
      if (!this.searchQuery) {
        return 0;
      }

      return 49;
    },
    mobileMode() {
      return this.$vuetify.breakpoint.mobile;
    },
    classListWidth() {
      // Listは基本固定だが、mobileの場合は最小幅を小さくし、画面に収まるようにする。
      return {
        'list-width-mobile': this.mobileMode,
        'list-width': !this.mobileMode,
      };
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
    openMainIfMobile() {
      if (!this.$vuetify.breakpoint.mobile) {
        return;
      }

      this.showList = false;
      this.showMain = true;
    },
    openListIfMobile() {
      if (!this.$vuetify.breakpoint.mobile) {
        return;
      }

      this.showList = true;
      this.showMain = false;
    },
    changeShowViewIfMobile() {
      switch (this.$route.name) {
        case 'NoteList':
          this.openListIfMobile();
          break;
        case 'AllNoteList':
          this.openListIfMobile();
          break;
        case 'Note':
          this.openMainIfMobile();
          break;
        case 'NoteInFolder':
          this.openMainIfMobile();
          break;
        default:
          break;
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

    // Mobileの場合、表示するViewを切り替える。
    this.changeShowViewIfMobile();
  },
  watch: {
    searchQuery(value) {
      if (value) {
        this.alert = true;
      }
    },
    $route() {
      this.changeShowViewIfMobile();
    },
    mobileMode(value) {
      if (value) {
        this.changeShowViewIfMobile();
      } else {
        this.showList = true;
        this.showMain = true;
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

.list-width {
  min-width: 350px;
}

.list-width-mobile {
  min-width: 200px;
}
</style>
