<template>
  <v-navigation-drawer
    :value="drawer"
    color="secondary"
    floating
    app
    style="z-index: 1"
    @input="$emit('input', $event)"
  >
    <v-card flat tile height="64px" color="primary" class="overflow-hidden">
      <img class="main-logo ma-4" alt="notenext_logo" src="../assets/logo.png" />
    </v-card>

    <v-card flat tile color="secondary" class="d-flex justify-space-between">
      <v-card-title class="text-body-1 font-weight-bold">{{ project.name }} </v-card-title>
      <v-card-actions>
        <ProjectSettingDialog v-slot="{ openDialog }" :projectId="projectId">
          <v-btn text icon :ripple="false" @click.stop="openDialog" id="open-project-setting-dialog-navdrawer">
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </ProjectSettingDialog>
      </v-card-actions>
    </v-card>

    <v-divider class="mb-2"></v-divider>

    <FolderSettingDialog v-slot="{ openDialog }" :projectId="projectId">
      <v-btn text block class="add-folder" @click.stop="openDialog" id="open-folder-create-dialog-navdrawer">
        <v-icon left> mdi-plus </v-icon> フォルダ新規作成
      </v-btn>
    </FolderSettingDialog>

    <v-card flat tile class="items">
      <v-list color="secondary">
        <v-list-item-group>
          <v-list-item
            :ripple="false"
            :to="{ name: 'AllNoteList', params: { projectId: projectId }, query: $route.query }"
            id="allnotelist-link-navdrawer"
          >
            <v-list-item-content>
              <v-list-item-title>新着ノート</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item
            v-for="(folder, i) in folders"
            :key="i"
            :ripple="false"
            :to="{
              name: 'NoteList',
              params: { projectId: projectId, folderId: folder.id },
              query: $route.query,
            }"
          >
            <v-list-item-icon class="mr-3">
              <v-icon>mdi-folder</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="folder.name"></v-list-item-title>
            </v-list-item-content>
            <v-badge
              v-if="folder.tasks_count"
              :content="folder.tasks_count"
              inline
              :color="`${taskColor} grey--text text--darken-4`"
              :id="`folder-badge-${folder.id}`"
            >
            </v-badge>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </v-navigation-drawer>
</template>

<script>
import FolderSettingDialog from '@/components/FolderSettingDialog.vue';
import ProjectSettingDialog from '@/components/ProjectSettingDialog.vue';
import { mapState } from 'vuex';
import taskInfo from '@/mixins/task-info';

export default {
  components: {
    FolderSettingDialog,
    ProjectSettingDialog,
  },
  mixins: [taskInfo],
  props: {
    drawer: Boolean,
    projectId: {
      type: [Number],
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      folders: state => state.folder.folders,
      project: state => state.project,
    }),
  },
};
</script>

<style scoped lang="scss">
.main-logo {
  display: block;
  width: 80%;
  height: auto;
}

.items {
  height: calc(100vh - 172px);
  overflow-x: hidden;
  overflow-y: auto;
  background-color: inherit;
}
</style>
