

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    reachedEndOfResults: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<template>
  <div>
    <p
      v-if="reachedEndOfResults"
      class="mt-4 mb-12 text-sm text-gray-500 dark:text-gray-200"
    >
      Reached the end of the results.
    </p>

    <button
      v-else
      :class="!reachedEndOfResults ? 'underline' : ''"
      class="justify-self-center cursor-pointer"
      @click="$emit('loadMore')"
    >
      Load more
    </button>
  </div>
</template>