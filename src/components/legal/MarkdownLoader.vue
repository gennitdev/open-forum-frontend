<script lang="ts">
import { defineComponent, ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import MarkdownPreview from '@/components/generic/MarkdownPreview.vue'
import axios from "axios";

export default defineComponent({
  name: "MarkdownLoader",
  components: {
    MarkdownPreview,
  },
  props: {
    slug: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const content = ref("");

    const loadPost = async (slug: string) => {
      try {
        const response = await axios.get(`/${slug}.md`);
        content.value = response.data;
      } catch (error) {
        console.error("Error loading post:", error);
      }
    };

    watch(
      () => route.params.slug,
      (newSlug) => {
        if (newSlug) {
          loadPost(newSlug as string);
        }
      },
      { immediate: true },
    );

    onMounted(() => {
      if (props.slug) {
        loadPost(props.slug as string);
      }
    });

    return {
      content,
    };
  },
});
</script>

<template>
  <div class="flex max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <MarkdownPreview
      :text="content"
      :disable-gallery="true"
      :word-limit="10000"
    />
  </div>
</template>
