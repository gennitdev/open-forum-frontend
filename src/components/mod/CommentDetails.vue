<script lang="ts">
import { defineComponent, computed } from "vue";
import { GET_COMMENT } from "@/graphQLData/comment/queries";
import { useQuery } from "@vue/apollo-composable";
import CommentHeader from "@/components/comments/CommentHeader.vue";
import MarkdownPreview from "@/components/generic/MarkdownPreview.vue";
import LoadingSpinner from "../generic/LoadingSpinner.vue";
import ErrorBanner from "../generic/ErrorBanner.vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "CommentDetails",
  components: {
    CommentHeader,
    MarkdownPreview,
    LoadingSpinner,
    ErrorBanner,
  },
  props: {
    commentId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const {
      result: commentResult,
      error: commentError,
      loading: commentLoading,
    } = useQuery(GET_COMMENT, {
      id: props.commentId,
    });

    const originalComment = computed(() => {
      if (commentLoading.value || commentError.value) {
        return null;
      }

      return commentResult.value?.comments && commentResult.value?.comments[0];
    });

    const permalinkObject = computed(() => {
      const discussionIdInLink =
        originalComment.value?.DiscussionChannel?.discussionId;
      const eventIdInLink = originalComment.value?.Event?.id;

      if (discussionIdInLink) {
        return {
          name: "DiscussionCommentPermalink",
          params: {
            discussionId: discussionIdInLink,
            commentId: props.commentId,
            channelId: channelId.value,
          },
        };
      }

      // if discussionId is not present, assume it is an event comment
      if (eventIdInLink) {
        return {
          name: "EventCommentPermalink",
          params: {
            eventId: eventIdInLink,
            commentId: props.commentId,
            channelId: channelId.value,
          },
        };
      }
      return {
       
      };
    });
    return {
      commentResult,
      commentError,
      commentLoading,
      originalComment,
      permalinkObject,
    };
  },
});
</script>

<template>
  <div class="flex w-full flex-col space-y-4">
    <LoadingSpinner v-if="commentLoading" />
    <ErrorBanner
      v-if="commentError"
      :text="commentError.message"
    />
    <div 
      v-else-if="originalComment" 
      class="flex items-center"
    >
      <CommentHeader
        :comment-data="originalComment"
        :is-highlighted="false"
        :parent-comment-id="originalComment?.parentCommentId"
        :show-context-link="true"
        :show-channel="false"
      />
      <router-link
        :to="permalinkObject"
        class="text-blue-500 underline"
      >
        Context
      </router-link>
    </div>
    <div class="ml-2 flex flex-col gap-2 border-l pl-4">
      <MarkdownPreview
        class="-ml-2"
        :text="originalComment?.text || '[Deleted]'"
        :disable-gallery="true"
      />
    </div>
  </div>
</template>
