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
              <v-btn text icon :ripple="false" v-bind="attrs" v-on="on">
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
                <v-list-item @click.stop="openDialog">
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
                <v-list-item @click.stop="openDialog">
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
            sortItem="lastUpdateDate"
            sortOrder="ascending"
            :sortItemList="sortItemList"
            :sortOrderList="sortOrderList"
            titleText="ノート並び順設定"
          >
            <button class="sort-button" v-bind="attrs" v-on="on">
              <BaseButton depressed class="ml-1" color="grey lighten-4" :width="120" fontWeight="font-weight-medium">
                更新日順
                <v-icon right> mdi-chevron-down </v-icon>
              </BaseButton>
            </button>
          </SortOrderDialog>
          <div class="mr-1">
            <BaseButton depressed class="green darken-1" :width="140" @click="createNote">
              <v-icon left> mdi-plus </v-icon>
              ノートを作成
            </BaseButton>
          </div>
        </div>
      </v-card>

      <v-list two-line class="items">
        <v-list-item-group v-if="notes">
          <template v-for="note in notes">
            <v-list-item
              :key="note.id"
              :ripple="false"
              class="white"
              active-class="grey lighten-3"
              :to="{
                name: 'NoteInFolder',
                params: { projectId: projectId, folderId: folderId, noteId: note.id },
              }"
            >
              <v-list-item-content>
                <v-list-item-title v-text="note.title" class="pb-2"></v-list-item-title>
                <v-list-item-subtitle v-text="note.text" class="mt-1 pl-1"></v-list-item-subtitle>
                <!-- <div class="d-flex align-center justify-space-between mt-3"> -->
                <!-- <v-avatar size="24">
                    <v-icon v-text="note.author.avater"></v-icon>
                  </v-avatar> -->
                <!-- <v-list-item-subtitle v-text="note.author.name"></v-list-item-subtitle> -->
                <!-- <div style="text-align: right"> -->
                <v-list-item-subtitle class="mt-3 ml-1" v-text="formatDate(note.updated_at)"></v-list-item-subtitle>
                <!-- </div> -->
                <!-- </div> -->
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="`divider-${note.id}`"></v-divider>
          </template>
        </v-list-item-group>
      </v-list>
    </template>
    <template v-slot:main>
      <router-view v-show="isRouteNote"></router-view>
      <div v-show="!isRouteNote">ノートを選択してください</div>
    </template>
  </CommonNoteList>
</template>

<script>
import FolderSettingDialog from '@/components/FolderSettingDialog.vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import SortOrderDialog from '@/components/SortOrderDialog.vue';
import CommonNoteList from '@/components/CommonNoteList.vue';
import redirect from '@/mixins/redirect';
import BaseButton from '@/components/BaseButton.vue';
import formatDate from '@/mixins/format-date';

export default {
  components: {
    FolderSettingDialog,
    ConfirmDeleteDialog,
    SortOrderDialog,
    CommonNoteList,
    BaseButton,
  },
  mixins: [redirect, formatDate],
  data() {
    return {
      menuValue: false,
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
      return 'このフォルダを削除します。よろしいですか？';
    },
    sortItemList() {
      return [
        {
          label: '更新日時',
          value: 'lastUpdateDate',
        },
        {
          label: '作成日',
          value: 'created_at',
        },
        {
          label: 'タイトル',
          value: 'noteTitle',
        },
        {
          label: '作成者',
          value: 'author',
        },
      ];
    },
    sortOrderList() {
      return [
        {
          label: '昇順',
          value: 'ascending',
        },
        {
          label: '降順',
          value: 'descending',
        },
      ];
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
  },
  methods: {
    deleteFolder() {
      this.$store.dispatch('folder/delete', { projectId: this.projectId, id: this.folderId }).then(() => {
        this.$router.push({ name: 'AllNoteList' });
      });
    },
    createNote() {
      this.$store.dispatch('note/create', { projectId: this.projectId, folderId: this.folderId }).then(data => {
        this.$router.push({
          name: 'NoteInFolder',
          params: { noteId: data.id },
        });
      });
    },
    changeMenuValue() {
      this.menuValue = !this.menuValue;
    },
    async getNotes(projectId, folderId) {
      return this.$store.dispatch('note/getNotesByfolderId', { projectId, folderId });
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // vm.isRouteNote = to.name === noteRouteName;
      vm.getNotes(vm.projectId, vm.folderId).catch(error => {
        vm.redirectTop(vm, error.response ? error.response.status : '');
      });
    });
  },
  beforeRouteUpdate(to, from, next) {
    // this.isRouteNote = to.name === noteRouteName;

    if (to.params.folderId !== from.params.folderId) {
      this.getNotes(to.params.projectId, to.params.folderId).then(() => {
        next();
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
  height: calc(100vh - 200px);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: inherit;
}
</style>
