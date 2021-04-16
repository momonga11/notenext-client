export const sortItemUpdatedAt = { label: '更新日時', value: 'updated_at' };
export const sortItemCreatedAt = { label: '作成日時', value: 'created_at' };
export const sortItemTitle = { label: 'タイトル', value: 'title' };
export const sortOrderValueAsc = 'asc';
export const sortOrderValueDesc = 'desc';

export const defaultSortValue = sortItemUpdatedAt.value;
export const defaultSortOrder = sortOrderValueAsc;

export const defaultSortItem = {
  computed: {
    defaultSortItem() {
      return {
        label: sortItemUpdatedAt.label,
        value: sortItemUpdatedAt.value,
        order: sortOrderValueAsc,
      };
    },
  },
};

export const sortItemList = {
  computed: {
    sortItemList() {
      return [sortItemUpdatedAt, sortItemCreatedAt, sortItemTitle];
    },
  },
};

export const sortOrderList = {
  computed: {
    sortOrderList() {
      return [
        {
          label: '昇順',
          value: sortOrderValueAsc,
        },
        {
          label: '降順',
          value: sortOrderValueDesc,
        },
      ];
    },
  },
};
