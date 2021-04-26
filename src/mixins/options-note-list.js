export default {
  methods: {
    hasTaskNoCompleted(note) {
      if (!note.task || !note.task.id) {
        return false;
      }

      return !note.task.completed;
    },
  },
};
