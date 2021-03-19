<template>
  <BaseAccountView>
    <v-card :width="width" class="mx-auto pb-5 container">
      <v-card-title class="title-message">
        <div class="d-flex mx-auto message">
          <v-icon large left> {{ titleIcon }} </v-icon>
          <span class="mx-4" id="message">{{ message }}</span>
        </div>
      </v-card-title>
      <BaseButton height="40" :to="{ name: 'signin' }" id="signin">OK</BaseButton>
    </v-card>
  </BaseAccountView>
</template>

<script>
import BaseAccountView from '@/components/BaseAccountView.vue';
import BaseButton from '@/components/BaseButton.vue';

export default {
  components: {
    BaseAccountView,
    BaseButton,
  },
  props: {
    message: {
      type: String,
      default: '',
    },
    titleIcon: {
      type: String,
      default: 'mdi-information-outline',
    },
    width: {
      type: Number,
      default: 900,
    },
  },
};
</script>

<style scoped="scss">
.container {
  text-align: center;
}

.title-message {
  text-align: left;
}

.message {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
