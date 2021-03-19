<template>
  <v-card v-bind="$attrs">
    <slot name="header-items"></slot>

    <v-btn text icon :ripple="false" absolute top right class="mt-n3 mr-n3" @click="cancelBtnClick" id="close-button">
      <v-icon>mdi-close-thick</v-icon>
    </v-btn>

    <v-card-title class="green lighten-5" id="title-text">
      {{ titleText }}
    </v-card-title>

    <slot></slot>

    <v-divider></v-divider>

    <v-card-actions>
      <CommitCancelButtonGroup
        :isVisbleCancelBtn="isVisbleCancelBtn"
        :isVisbleCommitBtn="isVisbleCommitBtn"
        :commitBtnText="commitBtnText"
        :commitBtnColor="commitBtnColor"
        :cancelBtnText="cancelBtnText"
        @commit-btn-click="commitBtnClick"
        @cancel-btn-click="cancelBtnClick"
      ></CommitCancelButtonGroup>
    </v-card-actions>

    <slot name="bottom-items"></slot>
  </v-card>
</template>

<script>
import CommitCancelButtonGroup from '@/components/CommitCancelButtonGroup.vue';

export default {
  inheritAttrs: false,
  components: {
    CommitCancelButtonGroup,
  },
  props: {
    titleText: {
      type: String,
      require: true,
    },
    isVisbleCommitBtn: {
      type: Boolean,
      default: true,
    },
    isVisbleCancelBtn: {
      type: Boolean,
      default: true,
    },
    commitBtnText: {
      type: String,
      default: '変更を保存',
    },
    cancelBtnText: {
      type: String,
      default: 'キャンセル',
    },
    commitBtnColor: {
      type: String,
      default: '',
    },
  },
  methods: {
    commitBtnClick() {
      this.$emit('commit-btn-click');
    },
    cancelBtnClick() {
      this.$emit('cancel-btn-click');
    },
  },
};
</script>
