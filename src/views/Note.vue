<template>
  <v-card height="100%" tile flat style="z-index: 1">
    <v-card height="48px" tile flat :color="headerColor" class="d-flex" id="note-header">
      <v-card-subtitle class="pa-1 note-folder-name overflow-hidden">{{ folderName }}</v-card-subtitle>
      <v-spacer></v-spacer>
      <div class="d-flex ma-1" v-if="hasTask">
        <v-card-actions style="width: 30%; min-width: 180px">
          <v-menu
            v-model="calendarMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="task.dateTo"
                placeholder="期限を設定"
                prepend-inner-icon="mdi-calendar-check"
                readonly
                v-bind="attrs"
                v-on="on"
                dense
                single-line
                hide-details
                clearable
                solo
                flat
                :background-color="headerColor"
                @input="updateTask"
                id="note-task-date-to"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="task.dateTo"
              @input="inputDataPicker"
              locale="ja-jp"
              :day-format="date => new Date(date).getDate()"
              no-title
              scrollable
              id="note-task-date-to-datepicker"
            >
            </v-date-picker>
          </v-menu>
        </v-card-actions>
        <v-card-actions style="min-width: 80px" v-if="!mobileMode">
          <v-checkbox
            v-model="task.completed"
            label="完了"
            dense
            @click="updateTask"
            id="note-task-completed"
          ></v-checkbox>
        </v-card-actions>
      </div>
      <v-card-actions>
        <BaseButton
          depressed
          class="mr-4"
          color="green darken-1 white--text"
          id="task-create-button"
          @click="createTask"
          v-if="!hasTask"
        >
          <v-icon left> mdi-check-underline </v-icon>
          タスク設定
        </BaseButton>
        <ConfirmDeleteDialog
          v-slot="{ openDialog }"
          :titleText="titleTextTaskDelete"
          :message="deleteTaskDialogText"
          @commit="deleteTask"
          v-if="hasTask && !mobileMode"
        >
          <BaseButton
            depressed
            class="mr-4"
            color="green darken-1 white--text"
            id="task-delete-button"
            @click="openDialog"
          >
            <template v-if="hasTask">
              <v-icon left> mdi-cancel </v-icon>
              タスク解除
            </template>
          </BaseButton>
        </ConfirmDeleteDialog>
        <v-menu offset-y v-model="isOpenMenu">
          <template v-slot:activator="{ on, attrs }">
            <v-btn text icon :ripple="false" v-bind="attrs" v-on="on" class="mr-1" id="open-note-menu">
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

            <template v-if="mobileMode && hasTask">
              <v-divider></v-divider>
              <v-list-item id="complete-task-item" class="lime lighten-5">
                <v-list-item-title>タスク完了</v-list-item-title>
                <v-list-item-action>
                  <v-checkbox
                    v-model="task.completed"
                    dense
                    @click="updateTask"
                    id="note-menu-task-completed"
                  ></v-checkbox>
                </v-list-item-action>
              </v-list-item>

              <ConfirmDeleteDialog
                v-slot="{ openDialog }"
                :titleText="titleTextTaskDelete"
                :message="deleteTaskDialogText"
                @open-dialog="changeMenuValue"
                @commit="deleteTask"
              >
                <v-list-item @click="openDialog" id="delete-task-item" class="lime lighten-5">
                  <v-list-item-title>タスク解除</v-list-item-title>
                </v-list-item>
              </ConfirmDeleteDialog>
            </template>
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
          @focus="isInitEditor = false"
          :editorHeaderSpaceHeight="editorHeaderSpaceHeight"
        ></CustomEditor>
      </ValidationProvider>
    </v-card>
    <v-btn
      fab
      absolute
      class="mobile-close-button"
      color="green lighten-4"
      @click="redirectNoteList"
      v-if="$vuetify.breakpoint.mobile"
      id="note-close"
      ><v-icon>mdi-close</v-icon>
    </v-btn>
  </v-card>
</template>

<script>
import CommonTitleField from '@/components/CommonTitleField.vue';
import CustomEditor from '@/components/CustomEditor.vue';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog.vue';
import redirect from '@/mixins/redirect';
import BaseButton from '@/components/BaseButton.vue';
import { validate } from 'vee-validate';
import taskInfo from '@/mixins/task-info';
import constants from '../consts/constants';
import message from '../consts/message';

const timerStatePattern = {
  scheduled: 'scheduled',
  running: 'running',
};
const apiAccessInterVal = 1000;
const defaultTask = () => {
  return { id: '', dateTo: '', completed: false };
};

export default {
  components: {
    CustomEditor,
    CommonTitleField,
    ConfirmDeleteDialog,
    BaseButton,
  },
  mixins: [redirect, taskInfo],
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
      runTimerStates: [], // {noteId , state, timerId}
      editorHeaderSpaceHeight: '205px',
      isOpenMenu: false,
      isInitEditor: false,
      task: defaultTask(),
      calendarMenu: false,
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
      return message.TEXT_DELETE_NOTE;
    },
    deleteTaskDialogText() {
      return message.TEXT_DELETE_TASK;
    },
    folderName() {
      const folder = this.$store.getters['folder/getFolderById'](this.note.folderId);
      return !folder ? '' : folder.name;
    },
    editorTextRules() {
      return `max:${constants.MAX_LENGTH_TEXT}`;
    },
    hasTask() {
      return this.task.id;
    },
    headerColor() {
      return this.hasTask && !this.task.completed ? this.taskColor : 'green lighten-5';
    },
    mobileMode() {
      return this.$vuetify.breakpoint.mobile;
    },
    titleTextTaskDelete() {
      return 'タスク解除確認';
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

          // タスク情報の設定
          if (data.task) {
            const { date_to, completed } = data.task;
            Object.assign(this.task, { id: data.task.id, dateTo: date_to, completed });
          } else {
            this.task = defaultTask();
          }

          this.isInitEditor = true;
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
      if (this.isInitEditor) {
        this.isInitEditor = false;
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
      // タイマーが存在しない場合は、状態をScheduledにしたのち、setTimeOut処理を呼ぶ。その際、戻り値のidを取得しておく。
      // タイマーの状態が実行中の場合は、実行中のsetTimeOut処理をクリアせず、状態を計画中に変える。
      // タイマーの状態が計画中の場合は、計画中のsetTimeOutをクリアし、次のsetTimeOut処理を呼ぶ
      const paramId = this.noteId;
      const runTimer = this.runTimerStates.find(state => state.noteId === paramId);
      if (!runTimer) {
        this.runTimerStates.push(
          this.createTimer(
            paramId,
            timerStatePattern.scheduled,
            setTimeout(this.update, apiAccessInterVal, { ...this.note })
          )
        );
      } else if (runTimer.state === timerStatePattern.running) {
        // 時間を置いて再度このメソッドを実行する
        setTimeout(this.updateNote, apiAccessInterVal);
      } else if (runTimer.state === timerStatePattern.scheduled) {
        clearTimeout(runTimer.timerId);
        runTimer.timerId = setTimeout(this.update, apiAccessInterVal, { ...this.note });
      }
    },
    createTimer(noteId, state, timerId) {
      return { noteId, state, timerId };
    },
    update(note) {
      // 最初に状態を実行中にする。実行後、状態が実行中の場合のみ、タイマーを取り除く。
      // 実行中でなかった場合は、すでに次の処理が計画中のため、その処理内で実行させる。
      const runTimer = this.runTimerStates.find(state => state.noteId === note.id);
      runTimer.state = timerStatePattern.running;
      // API呼び出し
      this.$store
        .dispatch('note/update', Object.assign(note, { projectId: this.projectId, folderId: note.folderId }))
        .finally(() => {
          // 成功失敗にかかわらず後処理を実行する
          if (runTimer && runTimer.state === timerStatePattern.running) {
            // 不要になったタイマーを取り除く。
            const newRunTimerStates = this.runTimerStates.filter(rts => rts.noteId !== note.id);
            this.runTimerStates = newRunTimerStates;
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
          this.redirectNoteList();
        })
        .catch(() => {});
    },
    redirectNoteList() {
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
    createTask() {
      this.$store
        .dispatch('note/createTask', { id: this.note.id, projectId: this.note.projectId, folderId: this.note.folderId })
        .then(data => {
          this.task.id = data.id;
        })
        .catch(() => {});
    },
    deleteTask() {
      this.$store
        .dispatch('note/deleteTask', {
          id: this.note.id,
          projectId: this.note.projectId,
          folderId: this.note.folderId,
          taskId: this.task.id,
        })
        .then(() => {
          this.task = defaultTask();
        })
        .catch(() => {});
    },
    updateTask() {
      this.$store
        .dispatch('note/updateTask', {
          id: this.note.id,
          projectId: this.note.projectId,
          taskId: this.task.id,
          dateTo: this.task.dateTo,
          completed: this.task.completed,
        })
        .catch(() => {});
    },
    inputDataPicker() {
      this.calendarMenu = false;
      this.updateTask();
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // load処理を実行する前に、初期化フラグをtrueにする必要がある（loadが非同期処理のため）
      vm.isInitEditor = true;
      vm.load(vm.projectId, vm.folderId, vm.noteId).catch(error => {
        vm.redirectTop(vm, error.response ? error.response.status : '');
      });
    });
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.noteId !== from.params.noteId) {
      this.load(to.params.projectId, to.params.folderId, to.params.noteId)
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

<style lang="scss" scoped>
.note-folder-name {
  min-width: 70px;
}

.mobile-close-button {
  top: 50%;
  left: 0%;
  opacity: 0.5;
}

.overflow-hidden {
  overflow: hidden;
}
</style>
