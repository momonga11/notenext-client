<template>
  <CommonNoteList :projectId="projectId" :searchQuery="searchQuery">
    <template v-slot:list="{ searchedAlertHeight }">
      <v-card height="48px" width="370px" tile outlined>
        <div class="d-flex justify-space-between">
          <v-card-title class="pa-2">新着ノート</v-card-title>
        </div>
      </v-card>
      <v-list
        two-line
        class="items"
        :height="`calc(100vh - 111px - ${searchedAlertHeight}px)`"
        id="all-note-list"
        v-scroll.self="onScroll"
      >
        <v-list-item-group v-model="selectednoteId">
          <template v-for="note in notes">
            <v-list-item
              :key="note.id"
              :ripple="false"
              class="white item"
              active-class="grey lighten-3"
              :to="{
                name: 'Note',
                params: { projectId: projectId, noteId: note.id, folderId: note.folder_id },
                query: $route.query,
              }"
            >
              <v-list-item-content class="pb-2">
                <v-list-item-subtitle
                  v-text="folder(note.folder_id) ? folder(note.folder_id).name : ''"
                  class="pb-2 text-caption"
                ></v-list-item-subtitle>
                <v-list-item-title v-text="note.title" class="pb-1"></v-list-item-title>
                <v-list-item-subtitle v-text="note.text" class="pl-1"></v-list-item-subtitle>
                <div class="d-flex mt-3">
                  <v-list-item-subtitle class="ml-1 py-1" v-text="formatDate(note.created_at)"></v-list-item-subtitle>
                  <v-list-item-subtitle v-if="hasTaskNoCompleted(note)" :class="`ml-2 pa-1 pr-0 ${taskColor}`">{{
                    `期限：${formatDateNoTime(note.task.date_to)}`
                  }}</v-list-item-subtitle>
                </div>
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="`divider-${note.id}`"></v-divider>
          </template>
        </v-list-item-group>
      </v-list>
    </template>
    <template v-slot:main>
      <router-view v-show="isRouteNote"></router-view>
      <NoSelectNote v-show="!isRouteNote" id="noselectnote-all"></NoSelectNote>
    </template>
  </CommonNoteList>
</template>

<script>
import CommonNoteList from '@/components/CommonNoteList.vue';
import NoSelectNote from '@/components/NoSelectNote.vue';
import { mapState } from 'vuex';
import formatDate from '@/mixins/format-date';
import optionsNotelist from '@/mixins/options-note-list';
import taskInfo from '@/mixins/task-info';
import store from '@/store';

const defaultPage = 1;
const getNotes = (_store, projectId, page, shouldOverwrite, searchQuery) => {
  return _store.dispatch('note/getNotesByProjectId', { projectId, page, shouldOverwrite, searchQuery });
};
const getFolders = (_store, projectId, searchQuery) => {
  if (searchQuery) {
    return _store.dispatch('folder/getFoldersExistsNote', { projectId, searchQuery });
  }

  return _store.dispatch('folder/getFolders', { projectId });
};

export default {
  components: {
    CommonNoteList,
    NoSelectNote,
  },
  mixins: [formatDate, optionsNotelist, taskInfo],
  data() {
    return {
      menuValue: false,
      selectednoteId: 1,
      page: defaultPage,
    };
  },
  props: {
    projectId: {
      type: [Number],
      required: true,
    },
    searchQuery: {
      type: [String],
    },
  },
  computed: {
    ...mapState({
      notes: state => state.note.notes,
    }),
    isRouteNote() {
      return this.$route.name === 'Note';
    },
  },
  methods: {
    folder(folderId) {
      return this.$store.getters['folder/getFolderById'](folderId);
    },
    onScroll(e) {
      // 最下部近くにスクロールバーが移動した場合、データを取得する
      if (e.target.scrollHeight <= Math.ceil(e.target.scrollTop) + e.target.offsetHeight) {
        getNotes(this.$store, this.projectId, this.page + 1, false, this.searchQuery)
          .then(data => {
            if (data.length) {
              this.page += 1;
            }
          })
          .catch(() => {});
      }
    },
  },
  mounted() {
    this.page = defaultPage;
  },
  beforeRouteEnter(to, from, next) {
    // ノートが表示されているのにフォルダが表示されていない、ということがないようにフォルダを再取得する
    getFolders(store, to.params.projectId, to.query.search)
      .then(() => {
        getNotes(store, to.params.projectId, defaultPage, true, to.query.search)
          .then(() => {
            next();
          })
          .catch(() => {
            next({ name: 'signin' });
          });
      })
      .catch(() => {
        next({ name: 'signin' });
      });
  },
  beforeRouteUpdate(to, from, next) {
    if (from.name === 'AllNoteList' && to.name !== 'AllNoteList') {
      // 本コンポーネントから別のコンポーネントに移動した際に後続のデータ取得処理を実行する必要はない。
      next();
      return;
    }

    if (to.name === from.name && to.query.search === from.query.search) {
      // 同じコンポーネント間で、クエリパラメータが同一の場合は後続のデータ取得処理を実行する必要はない。
      next();
      return;
    }

    // ノートが表示されているのにフォルダが表示されていない、ということがないようにフォルダを再取得する
    getFolders(this.$store, to.params.projectId, to.query.search)
      .then(() => {
        getNotes(this.$store, to.params.projectId, defaultPage, true, to.query.search)
          .then(() => {
            // pageを初期化する
            this.page = defaultPage;
            next();
          })
          .catch(() => {
            next(false);
          });
      })
      .catch(() => {
        next(false);
      });
  },
};
</script>

<style scoped lang="scss">
.items {
  overflow-x: hidden;
  overflow-y: auto;
  background-color: inherit;
}
.item {
  margin-bottom: 0.5px;
}
</style>
