<script lang="ts">
import { defineComponent, PropType } from "vue";
import MarkdownPreview from "@/components/generic/MarkdownPreview.vue";
import { Event } from "@/__generated__/graphql";

export default defineComponent({
  name: "EventBody",
  components: {
    MarkdownPreview,
  },
  props: {
    event: {
      type: Object as PropType<Event>,
      required: true,
    },
  },
  setup(props) {
    return {
      description: props.event.description,
    };
  },
});
</script>
<template>
  <MarkdownPreview
    :text="description || ''"
    :disable-gallery="false"
  />
</template>
