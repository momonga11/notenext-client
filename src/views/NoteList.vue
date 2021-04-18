<template>
  <CommonNoteList>
    <template v-slot:list>
      <v-card height="120px" width="370px" tile class="d-flex flex-column justify-space-between" outlined>
        <div class="d-flex justify-space-between">
          <v-card-title class="pa-1">
            <div class="overflow-text folder-name">
              <template v-if="folder">{{ folder.name }}</template>
            </div>
          </v-card-title>
          <v-menu offset-y v-model="menuValue">
            <template v-slot:activator="{ on, attrs }">
              <v-btn text icon :ripple="false" v-bind="attrs" v-on="on" id="folder-setting-notelist">
                <v-icon>mdi-cog</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <FolderSettingDialog
                v-slot="{ openDialog }"
                :id="folderId"
                :projectId="projectId"
                @open-dialog="changeMenuValue"
              >
                <v-list-item @click.stop="openDialog" id="open-folder-update-dialog-notelist">
                  <v-list-item-title>フォルダ設定</v-list-item-title>
                </v-list-item>
              </FolderSettingDialog>
              <ConfirmDeleteDialog
                v-slot="{ openDialog }"
                titleText="フォルダ削除確認"
                :message="deleteDialogText"
                @open-dialog="changeMenuValue"
                @commit="deleteFolder"
              >
                <v-list-item @click.stop="openDialog" id="open-folder-delete-dialog-notelist">
                  <v-list-item-title>フォルダ削除</v-list-item-title>
                </v-list-item>
              </ConfirmDeleteDialog>
            </v-list>
          </v-menu>
        </div>
        <v-card-subtitle class="py-1 px-2 mb-2 overflow-text folder-description"
          ><template v-if="folder">{{ folder.description }}</template>
        </v-card-subtitle>
        <div class="d-flex justify-space-between mb-1">
          <SortOrderDialog
            v-slot="{ on, attrs }"
            :sortItem="sortedInfo.value"
            :sortOrder="sortedInfo.order"
            :sortItemList="sortItemList"
            :sortOrderList="sortOrderList"
            titleText="ノート並び順設定"
            @commit-btn-click="sortNotes"
          >
            <button class="sort-button" v-bind="attrs" v-on="on">
              <BaseButton
                depressed
                class="ml-1"
                color="grey lighten-4"
                :width="120"
                fontWeight="font-weight-medium"
                id="sort-note-list"
              >
                {{ `${sortedInfo.label}順` }}
                <v-icon right v-if="isSortedOrderValueAsc" id="sort-icon-down"> mdi-chevron-down </v-icon>
                <v-icon right v-else id="sort-icon-up"> mdi-chevron-up </v-icon>
              </BaseButton>
            </button>
          </SortOrderDialog>
          <div class="mr-1">
            <BaseButton
              depressed
              color="green darken-1 white--text"
              :width="140"
              @click="createNote"
              id="create-note-notelist"
            >
              <v-icon left> mdi-plus </v-icon>
              ノートを作成
            </BaseButton>
          </div>
        </div>
      </v-card>

      <v-list two-line class="items" v-scroll.self="onScroll">
        <v-list-item-group v-if="notes">
          <template v-for="note in notes">
            <v-list-item
              :key="note.id"
              :ripple="false"
              class="white item"
              active-class="grey lighten-3"
              :to="{
                name: 'NoteInFolder',
                params: { projectId: projectId, folderId: folderId, noteId: note.id },
              }"
            >
              <v-list-item-content>
                <v-list-item-title v-text="note.title" class="pb-2"></v-list-item-title>
                <v-list-item-subtitle v-text="note.text" class="mt-1 pl-1"></v-list-item-subtitle>
                <v-list-item-subtitle
                  class="mt-3 ml-1"
                  v-if="isSortedCreatedAt"
                  v-text="formatDate(note.created_at)"
                ></v-list-item-subtitle>
                <v-list-item-subtitle
                  class="mt-3 ml-1"
                  v-else
                  v-text="formatDate(note.updated_at)"
                ></v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="`divider-${note.id}`"></v-divider>
          </template>
        </v-list-item-group>
      </v-list>
    </template>
    <template v-slot:main>
      <router-view v-show="isRouteNote"></router-view>
      <NoSelectNote v-show="!isRouteNote" id="noselectnote"></NoSelectNote>
    </template>
  </CommonNoteList>
</template>

<script>
import FolderSettingDialog from '@/components/FolderSettingDialog.vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import SortOrderDialog from '@/components/SortOrderDialog.vue';
import CommonNoteList from '@/components/CommonNoteList.vue';
import NoSelectNote from '@/components/NoSelectNote.vue';
import redirect from '@/mixins/redirect';
import BaseButton from '@/components/BaseButton.vue';
import formatDate from '@/mixins/format-date';
import {
  defaultSortItem,
  sortItemList,
  sortOrderList,
  defaultSortValue,
  defaultSortOrder,
  sortOrderValueAsc,
  sortItemCreatedAt,
} from '@/mixins/inputInfo/note-sort-info';
import store from '@/store';
import message from '@/consts/message';

const defaultPage = 1;

// Folderに紐づくNoteを取得する。
const getNotes = (_store, projectId, folderId, page, shouldOverwrite, sortItem, sortOrder) => {
  let paramSortItem = sortItem;
  let paramSortOrder = sortOrder;

  if (!sortItem) {
    // 前回ソートした記録を取得する
    const folderAction = _store.getters['folder/getFolderActionById'](folderId);
    if (folderAction) {
      paramSortItem = folderAction.sortItem;
      paramSortOrder = folderAction.sortOrder;
    } else {
      // ソートが指定されておらず、前回ソートした記録もない場合は、デフォルトのソートを指定する
      paramSortItem = defaultSortValue;
      paramSortOrder = defaultSortOrder;
    }
  }

  return _store.dispatch('note/getNotesByfolderId', {
    projectId,
    folderId,
    page,
    shouldOverwrite,
    sortItem: paramSortItem,
    sortOrder: paramSortOrder,
  });
};

export default {
  components: {
    FolderSettingDialog,
    ConfirmDeleteDialog,
    SortOrderDialog,
    CommonNoteList,
    BaseButton,
    NoSelectNote,
  },
  mixins: [redirect, formatDate, defaultSortItem, sortItemList, sortOrderList],
  data() {
    return {
      menuValue: false,
      page: defaultPage,
    };
  },
  props: {
    projectId: {
      type: [Number],
      required: true,
    },
    folderId: {
      type: [Number],
      required: true,
    },
  },
  computed: {
    deleteDialogText() {
      return message.TEXT_DELETE_FOLDER;
    },
    folder() {
      return this.$store.getters['folder/getFolderById'](this.folderId);
    },
    notes() {
      return this.$store.getters['note/getNotesByfolderId'](this.folderId);
    },
    isRouteNote() {
      return this.$route.name === 'NoteInFolder';
    },
    sortedInfo() {
      // 以前のソートの記録がある場合はその情報を返し、記録がない場合はデフォルトソートの情報を返す
      const folderAction = this.$store.getters['folder/getFolderActionById'](this.folderId);
      if (!folderAction) {
        return this.defaultSortItem;
      }
      const sortItem = this.sortItemList.filter(si => si.value === folderAction.sortItem);
      const sortOrder = this.sortOrderList.filter(si => si.value === folderAction.sortOrder);

      if (!sortItem || !sortOrder) {
        return this.defaultSortItem;
      }

      return { label: sortItem[0].label, value: sortItem[0].value, order: sortOrder[0].value };
    },
    isSortedOrderValueAsc() {
      return this.sortedInfo.order === sortOrderValueAsc;
    },
    isSortedCreatedAt() {
      return this.sortedInfo.value === sortItemCreatedAt.value;
    },
  },
  methods: {
    deleteFolder() {
      this.$store
        .dispatch('folder/delete', { projectId: this.projectId, id: this.folderId })
        .then(() => {
          this.$router.push({ name: 'AllNoteList' });
        })
        .catch(() => {});
    },
    createNote() {
      this.$store
        .dispatch('note/create', { projectId: this.projectId, folderId: this.folderId })
        .then(data => {
          this.$router.push({
            name: 'NoteInFolder',
            params: { noteId: data.id },
          });
        })
        .catch(() => {});
    },
    changeMenuValue() {
      this.menuValue = !this.menuValue;
    },
    onScroll(e) {
      // 最下部近くにスクロールバーが移動した場合、データを取得する
      if (e.target.scrollHeight <= Math.ceil(e.target.scrollTop) + e.target.offsetHeight) {
        getNotes(this.$store, this.projectId, this.folderId, this.page + 1, false)
          .then(data => {
            if (data.length) {
              this.page += 1;
            }
          })
          .catch(() => {});
      }
    },
    sortNotes(sortItem, sortOrder) {
      getNotes(this.$store, this.projectId, this.folderId, defaultPage, true, sortItem, sortOrder)
        .then(() => {
          // ソートの記録を保持する
          this.$store.commit('folder/setFolderAction', { id: this.folderId, sortItem, sortOrder });
        })
        .catch(() => {});
    },
  },
  beforeRouteEnter(to, from, next) {
    getNotes(store, to.params.projectId, to.params.folderId, defaultPage, true)
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
    if (Number(to.params.folderId) !== Number(from.params.folderId)) {
      getNotes(this.$store, to.params.projectId, to.params.folderId, defaultPage, true)
        .then(() => {
          next();
        })
        .catch(() => {
          next(false);
        });
    } else {
      next();
    }
  },
};
</script>

<style scoped lang="scss">
.sort-button {
  outline: none;
}

.overflow-text {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.folder-name {
  width: 310px;
}

.folder-description {
  width: 370px;
}

.items {
  height: calc(100vh - 184px);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: inherit;
}

.item {
  margin-bottom: 0.1px;
}
</style>
