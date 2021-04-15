<template>
  <CommonNoteList>
    <template v-slot:list>
      <v-card height="48px" width="370px" tile outlined>
        <div class="d-flex justify-space-between">
          <v-card-title class="pa-2">新着ノート</v-card-title>
        </div>
      </v-card>
      <v-list two-line class="items" v-scroll.self="onScroll">
        <v-list-item-group v-model="selectednoteId">
          <template v-for="note in notes">
            <v-list-item
              :key="note.id"
              :ripple="false"
              class="white"
              active-class="grey lighten-3"
              :to="{ name: 'Note', params: { projectId: projectId, noteId: note.id, folderId: note.folder_id } }"
            >
              <v-list-item-content>
                <v-list-item-subtitle
                  v-text="folder(note.folder_id).name"
                  class="pb-2 text-caption"
                ></v-list-item-subtitle>
                <v-list-item-title v-text="note.title" class="pb-1"></v-list-item-title>
                <v-list-item-subtitle v-text="note.text" class="pl-1"></v-list-item-subtitle>
                <v-list-item-subtitle class="mt-3 ml-1" v-text="formatDate(note.updated_at)"></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="`divider-${note.id}`"></v-divider>
          </template>
        </v-list-item-group>
      </v-list>
    </template>
    <template v-slot:main>
      <router-view v-show="isRouteNote"></router-view>
      <div v-show="!isRouteNote" id="noselectnote-all"><NoSelectNote></NoSelectNote></div>
    </template>
  </CommonNoteList>
</template>

<script>
import CommonNoteList from '@/components/CommonNoteList.vue';
import NoSelectNote from '@/components/NoSelectNote.vue';
import { mapState } from 'vuex';
import formatDate from '@/mixins/format-date';
import store from '@/store';

const defaultPage = 1;
const getNotes = (_store, projectId, page, shouldOverwrite) => {
  return _store.dispatch('note/getNotesByprojectId', { projectId, page, shouldOverwrite });
};

export default {
  components: {
    CommonNoteList,
    NoSelectNote,
  },
  mixins: [formatDate],
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
        getNotes(this.$store, this.projectId, this.page + 1, false)
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
    getNotes(store, to.params.projectId, defaultPage, true)
      .then(() => {
        next();
      })
      .catch(() => {
        next({ name: 'signin' });
      });
  },
};
</script>

<style scoped lang="scss">
.items {
  height: calc(100vh - 111px);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: inherit;
}
</style>
