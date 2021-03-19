<template>
  <editor
    id="editor"
    :options="editorOptions"
    height="auto"
    initialEditType="wysiwyg"
    ref="toastuiEditor"
    @change="change"
    :initialValue="initialValue"
  />
</template>

<script>
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/vue-editor';
import '@toast-ui/editor/dist/i18n/ja-jp';

export default {
  components: {
    editor: Editor,
  },
  props: {
    initialValue: {
      type: String,
      default: '',
    },
    editorUnderSpaceHeight: {
      type: String,
      default: '0px',
    },
  },
  data() {
    return {
      isComposing: false,
      editorOptions: {
        language: 'ja-JP',
        useCommandShortcut: false,
        useDefaultHTMLSanitizer: true,
        hideModeSwitch: true,
        usageStatistics: false,
        toolbarItems: [
          'heading',
          'bold',
          'italic',
          'strike',
          'divider',
          'hr',
          'quote',
          'divider',
          'ul',
          'ol',
          'task',
          'indent',
          'outdent',
          'divider',
          'table',
          'image',
          'link',
          'divider',
          'code',
          'codeblock',
        ],
        hooks: {
          addImageBlobHook: (fileOrBlob, callback) => {
            this.$emit('add-image-blob', fileOrBlob, callback);
          },
        },
      },
    };
  },
  methods: {
    change() {
      if (!this.isComposing) {
        this.changeEditor();
      }
    },
    getText() {
      return this.$refs.toastuiEditor.invoke('getSquire').body.innerText;
    },
    getHtmlText() {
      return this.$refs.toastuiEditor.invoke('getHtml');
    },
    setHtmlToEditor(html) {
      this.$refs.toastuiEditor.invoke('setHtml', html, false);
    },
    changeEditor() {
      this.$emit('change', this.getHtmlText(), this.getText());
    },
    setEditorUnderSpaceHeight(value) {
      const editor = document.querySelector('.te-ww-container .te-editor');
      editor.style.setProperty('--under-height', value);
    },
    addImageBlob(blob, callback) {
      console.log(blob);
      console.log(callback);
    },
  },
  mounted() {
    // IME変換処理にてchangeイベントを発生させないようにする。
    const editorEle = document.querySelector('#editor div[contenteditable="true"]');
    editorEle.addEventListener('compositionstart', () => {
      this.isComposing = true;
    });
    editorEle.addEventListener('compositionend', () => {
      this.isComposing = false;
      this.changeEditor();
    });

    // Editorの高さを設定する。
    this.setEditorUnderSpaceHeight(this.editorUnderSpaceHeight);
  },
};
</script>

<style lang="scss">
.tui-editor-contents {
  font-size: 16px !important;
}

.te-ww-container .te-editor {
  // editorの下のスペースの高さ
  --under-height: 0px;

  height: calc(99vh - var(--under-height)) !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  margin-bottom: 1vh;
}

#editor img {
  max-width: 480px !important;
  max-height: 560px !important;
}
</style>
