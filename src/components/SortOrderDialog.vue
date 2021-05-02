<template>
  <v-dialog v-model="dialog" width="400" @click:outside="cancelBtnClick" :fullscreen="$vuetify.breakpoint.mobile">
    <template v-slot:activator="{ on, attrs }">
      <slot :on="on" :attrs="attrs"></slot>
    </template>

    <CommonDialogCard :titleText="titleText" @cancel-btn-click="cancelBtnClick" @commit-btn-click="commitBtnClick">
      <v-container class="px-8">
        <v-row>
          <v-col>
            <v-radio-group v-model="selectedSortItem">
              <v-radio
                v-for="(item, i) in sortItemList"
                :key="i"
                :label="item.label"
                :value="item.value"
                color="primary"
                :id="`sort-item-${i}`"
              ></v-radio>
            </v-radio-group>
          </v-col>
          <v-col>
            <v-radio-group v-model="selectedSortOrder">
              <v-radio
                v-for="(item, i) in sortOrderList"
                :key="i"
                :label="item.label"
                :value="item.value"
                color="primary"
                :id="`sort-order-${i}`"
              ></v-radio> </v-radio-group
          ></v-col>
        </v-row>
      </v-container>
    </CommonDialogCard>
  </v-dialog>
</template>

<script>
import CommonDialogCard from '@/components/CommonDialogCard.vue';

// propsで利用する共通関数を定義する
const validateRadioGroupProps = aryObj => {
  return aryObj.every(obj => {
    return 'label' in obj && 'value' in obj;
  });
};

export default {
  components: {
    CommonDialogCard,
  },
  props: {
    titleText: {
      type: String,
      required: true,
    },
    sortItem: {
      type: String,
      required: true,
    },
    sortOrder: {
      type: String,
      required: true,
    },
    sortItemList: {
      type: Array,
      required: true,
      validator(data) {
        // labelとvalueをプロパティにもつObjectの配列でなければならない。
        return validateRadioGroupProps(data);
      },
    },
    sortOrderList: {
      type: Array,
      required: true,
      validator(data) {
        // labelとvalueをプロパティにもつObjectの配列でなければならない。
        return validateRadioGroupProps(data);
      },
    },
  },
  data() {
    return {
      dialog: false,
      selectedSortItem: '',
      selectedSortOrder: '',
    };
  },
  methods: {
    close() {
      this.dialog = false;
    },
    commitBtnClick() {
      this.$emit('commit-btn-click', this.selectedSortItem, this.selectedSortOrder);
      this.close();
    },
    cancelBtnClick() {
      this.close();
    },
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        // ダイヤログを開いた時の初期化
        this.selectedSortItem = this.sortItem;
        this.selectedSortOrder = this.sortOrder;
      }
    },
  },
};
</script>
