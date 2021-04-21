<template>
  <v-card height="100%" tile flat style="z-index: 1">
    <v-card height="48px" tile flat color="green lighten-5" class="d-flex">
      <v-card-subtitle class="pa-1">{{ folderName }}</v-card-subtitle>
      <v-spacer></v-spacer>
      <v-card-actions>
        <BaseButton depressed class="mr-4" color="green darken-1 white--text" id="task-set-button">
          <v-icon left> mdi-plus </v-icon>
          タスク設定
        </BaseButton>
        <v-menu offset-y v-model="isOpenMenu">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text icon :ripple="false" v-bind="attrs" v-on="on" class="mr-4" id="open-note-menu">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </template>

          <v-list dense>
            <v-list-item @click="copyNote" id="copy-note">
              <v-list-item-title>コピー</v-list-item-title>
            </v-list-item>

            <ConfirmDeleteDialog
              v-slot="{ openDialog }"
              titleText="ノート削除確認"
              :message="deleteDialogText"
              @open-dialog="changeMenuValue"
              @commit="deleteNote"
            >
              <v-list-item @click.stop="openDialog" id="delete-note">
                <v-list-item-title>削除</v-list-item-title>
              </v-list-item>
            </ConfirmDeleteDialog>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
    <v-card class="main mx-2" tile flat>
      <ValidationProvider ref="providerTitle" v-slot="{ errors }" name="タイトル" rules="max:255">
        <CommonTitleField
          :value="note.title"
          label="タイトル"
          class="text-h6 mb-2"
          @input="inputTitle"
          :error-messages="errors"
          id="title-note"
        ></CommonTitleField>
      </ValidationProvider>

      <ValidationProvider ref="providerEditor" v-slot="{ errors }" name="テキスト" :rules="editorTextRules">
        <span class="error--text text-caption">{{ errors[0] }}</span>
        <CustomEditor
          ref="editor"
          @change="changeEditor"
          @add-image-blob="addImageBlob"
          :editorUnderSpaceHeight="editorUnderSpaceHeight"
        ></CustomEditor>
      </ValidationProvider>
    </v-card>
  </v-card>
</template>

<script>
import CommonTitleField from '@/components/CommonTitleField.vue';
import CustomEditor from '@/components/CustomEditor.vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import redirect from '@/mixins/redirect';
import BaseButton from '@/components/BaseButton.vue';
import { validate } from 'vee-validate';
import constants from '../consts/constants';

const taskStatePattern = {
  scheduled: 'scheduled',
  running: 'running',
};
const apiAccessInterVal = 1000;

export default {
  components: {
    CustomEditor,
    CommonTitleField,
    ConfirmDeleteDialog,
    BaseButton,
  },
  mixins: [redirect],
  data() {
    return {
      note: {
        id: '',
        title: '',
        text: '',
        htmltext: '',
        projectId: '',
        folderId: '',
      },
      runTaskStates: [], // {noteId , state, taskId}
      editorUnderSpaceHeight: '205px',
      isOpenMenu: false,
      isInitialized: false,
    };
  },
  props: {
    projectId: {
      type: [Number],
      required: true,
    },
    folderId: {
      type: [Number],
      default: null,
    },
    noteId: {
      type: [Number],
      required: true,
    },
    searchQuery: {
      type: [String],
    },
  },
  computed: {
    deleteDialogText() {
      return 'このノートを削除します。よろしいですか？';
    },
    folderName() {
      const folder = this.$store.getters['folder/getFolderById'](this.note.folderId);
      return !folder ? '' : folder.name;
    },
    editorTextRules() {
      return `max:${constants.MAX_LENGTH_TEXT}`;
    },
  },
  methods: {
    async load(projectId, folderId, noteId) {
      this.$refs.providerTitle.reset();
      this.$refs.providerEditor.reset();

      return this.$store
        .dispatch('note/get', {
          id: noteId,
          projectId,
          folderId,
        })
        .then(data => {
          const { id, title, text, htmltext } = data;
          Object.assign(this.note, {
            id,
            title,
            text,
            htmltext,
            projectId: data.project_id,
            folderId: data.folder_id, // プロパティのフォルダIDはURLによっては取得できないので、APIから取得した値を設定する
          });

          this.isInitialized = true;
          this.setHtmlToEditor(htmltext);

          // safariの場合、Editorにフォーカスが当たっていると、キャレットがおかしなところについてしまう問題があった。
          // そのため別のところにフォーカスをあてて、外す暫定処置を実装する
          const elemTitle = document.getElementById('title-note');
          if (elemTitle) {
            document.getElementById('title-note').focus();
            document.getElementById('title-note').blur();
          }
        });
    },
    inputTitle(value) {
      this.note.title = value;
      this.updateNote();
    },
    changeEditor(htmltext, text) {
      // 初期化時は処理しない
      if (this.isInitialized) {
        this.isInitialized = false;
        return;
      }

      this.note.htmltext = htmltext;
      this.note.text = text;

      this.updateNote();
    },
    async validateTitle() {
      return this.$refs.providerTitle.validate(this.note.title).then(({ valid }) => {
        return valid;
      });
    },
    async validateEditorText() {
      return this.$refs.providerEditor.validate(this.note.text).then(({ valid }) => {
        return valid;
      });
    },
    async updateNote() {
      // 更新対象のバリデーションを実施
      const validTitle = await this.validateTitle();
      const validEditor = await this.validateEditorText();

      if (!validTitle || !validEditor) {
        return;
      }

      // 現在のステータスを確認
      // タスクが存在しない場合は、状態をScheduledにしたのち、setTimeOut処理を呼ぶ。その際、戻り値のidを取得しておく。
      // タスクの状態が実行中の場合は、実行中のsetTimeOut処理をクリアせず、状態を計画中に変える。
      // タスクの状態が計画中の場合は、計画中のsetTimeOutをクリアし、次のsetTimeOut処理を呼ぶ
      const paramId = this.noteId;
      const runTask = this.runTaskStates.find(state => state.noteId === paramId);
      if (!runTask) {
        this.runTaskStates.push(
          this.createTask(
            paramId,
            taskStatePattern.scheduled,
            setTimeout(this.update, apiAccessInterVal, { ...this.note })
          )
        );
      } else if (runTask.state === taskStatePattern.running) {
        // 時間を置いて再度このメソッドを実行する
        setTimeout(this.updateNote, apiAccessInterVal);
      } else if (runTask.state === taskStatePattern.scheduled) {
        clearTimeout(runTask.taskId);
        runTask.taskId = setTimeout(this.update, apiAccessInterVal, { ...this.note });
      }
    },
    createTask(noteId, state, taskId) {
      return { noteId, state, taskId };
    },
    update(note) {
      // 最初に状態を実行中にする。実行後、状態が実行中の場合のみ、タスクを取り除く。
      // 実行中でなかった場合は、すでに次の処理が計画中のため、その処理内で実行させる。
      const runTask = this.runTaskStates.find(state => state.noteId === note.id);
      runTask.state = taskStatePattern.running;
      // API呼び出し
      this.$store
        .dispatch('note/update', Object.assign(note, { projectId: this.projectId, folderId: note.folderId }))
        .finally(() => {
          // 成功失敗にかかわらず後処理を実行する
          if (runTask && runTask.state === taskStatePattern.running) {
            // 不要になったタスクを取り除く。
            const newRunTaskStates = this.runTaskStates.filter(rts => rts.noteId !== note.id);
            this.runTaskStates = newRunTaskStates;
          }
        });
    },
    deleteNote() {
      this.$store
        .dispatch('note/delete', {
          id: this.note.id,
          projectId: this.projectId,
          folderId: this.folderId,
        })
        .then(() => {
          // 自分のrootがどこかによって移動先が変わる。
          switch (this.$route.name) {
            case 'NoteInFolder':
              this.$router.push({
                name: 'NoteList',
                params: { folderId: this.folderId },
                query: this.$route.query,
              });
              break;
            case 'Note':
              this.$router.push({ name: 'AllNoteList', query: this.$route.query });
              break;
            default:
              this.$router.push({ name: 'AllNoteList', query: this.$route.query });
              break;
          }
        })
        .catch(() => {});
    },
    copyNote() {
      this.$store
        .dispatch('note/copy', this.note)
        .then(response => {
          this.$router.push({
            name: this.$router.name,
            params: { noteId: response.id },
            query: this.$route.query,
          });
        })
        .catch(() => {});
    },
    setHtmlToEditor(html) {
      this.$refs.editor.setHtmlToEditor(html);
    },
    setEditorUnderSpaceHeight() {
      this.$refs.editor.setEditorUnderSpaceHeight(this.editorUnderSpaceHeight);
    },
    changeMenuValue() {
      this.isOpenMenu = !this.isOpenMenu;
    },
    async addImageBlob(fileOrBlob, callback) {
      // Validate
      const valResult = await validate(fileOrBlob, `image|size:${constants.MAX_SIZE_KB_UPLOAD_IMAGE_FILE}`);

      if (valResult.valid) {
        const reader = new FileReader();
        reader.onload = e => {
          // API連携
          this.$store
            .dispatch('note/attachImage', {
              id: this.note.id,
              projectId: this.note.projectId,
              images: { data: e.target.result, filename: fileOrBlob.name },
            })
            .then(response => {
              callback(response.image_url, '');
            })
            .catch(() => {});
        };
        reader.readAsDataURL(fileOrBlob);
      } else {
        this.$refs.providerEditor.setErrors(valResult);
      }
      this.$refs.providerEditor.applyResult(valResult);
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // TODO: 紐づくタスクがある場合は取得する（紐づくタスクの件数をnoteと一緒に取得しておく）
      // load処理を実行する前に、初期化フラグをtrueにする必要がある（loadが非同期処理のため）
      vm.isInitialized = true;
      vm.load(vm.projectId, vm.folderId, vm.noteId).catch(error => {
        vm.redirectTop(vm, error.response ? error.response.status : '');
      });
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.noteId !== from.params.noteId) {
      this.load(to.params.projectId, to.params.folderId, to.params.noteId)
        .then(() => {
          // TODO 紐づくタスクから高さを設定する
          this.setEditorUnderSpaceHeight(this.editorUnderSpaceHeight);
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
