<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { Comment } from "@/__generated__/graphql";
import { GET_LOCAL_MOD_PROFILE_NAME, GET_LOCAL_USERNAME } from "@/graphQLData/user/queries";
import { useQuery } from "@vue/apollo-composable";
import { useRoute } from "vue-router";
import VoteButtons from "./VoteButtons.vue";
import ReplyButton from "./ReplyButton.vue";
import SaveButton from "@/components/generic/buttons/SaveButton.vue";
import TextEditor from "@/components/generic/forms/TextEditor.vue";
import CancelButton from "@/components/generic/buttons/CancelButton.vue";
import EmojiButtons from "./EmojiButtons.vue";
import NewEmojiButton from "./NewEmojiButton.vue";

export default defineComponent({
  name: "CommentButtons",
  components: {
    NewEmojiButton,
    CancelButton,
    EmojiButtons,
    ReplyButton,
    SaveButton,
    TextEditor,
    VoteButtons,
  },
  props: {
    commentData: {
      type: Object as PropType<Comment>,
      required: true,
    },
    enableFeedback: {
      type: Boolean,
      default: true,
    },
    depth: {
      type: Number,
      required: true,
    },
    locked: {
      type: Boolean,
      default: false,
    },
    parentCommentId: {
      type: String,
      default: "",
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    showEditCommentField: {
      type: Boolean,
      default: false,
    },
    showReplies: {
      type: Boolean,
      default: true,
    },
    commentInProcess: {
      type: Boolean,
      default: false,
    },
    replyFormOpenAtCommentID: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const route = useRoute();

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const {
      result: localUsernameResult,
      loading: localUsernameLoading,
      error: localUsernameError,
    } = useQuery(GET_LOCAL_USERNAME);

    const username = computed(() => {
      if (localUsernameLoading.value || localUsernameError.value) {
        return "";
      }
      return localUsernameResult.value.username;
    });

    const loggedInUserIsAuthor = computed(() => {
      if (!props.commentData) {
        return false;
      }
      return props.commentData.CommentAuthor?.username === username.value;
    });

    return {
      loggedInUserIsAuthor,
      loggedInUserModName,
      route,
      showEmojiPicker: ref(false),
      username
    };
  },
  methods: {
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
      if (this.showEmojiPicker) {
        this.$emit("hideReplyEditor");
      }
    },
  },
});
</script>
<template>
  <div class="w-full">
    <EmojiButtons
      v-if="!locked"
      :key="commentData.emoji"
      class="mb-1"
      :comment-id="commentData.id"
      :emoji-json="commentData.emoji"
      @toggleEmojiPicker="toggleEmojiPicker"
    />
    <div
      class="flex flex-wrap items-center gap-1 text-xs text-gray-400 dark:text-gray-300"
    >
      <VoteButtons
        v-if="!locked"
        :comment-data="commentData"
        :show-downvote="enableFeedback && !loggedInUserIsAuthor"
        @openModProfile="$emit('openModProfile')"
        @clickFeedback="$emit('clickFeedback')"
        @clickUndoFeedback="$emit('clickUndoFeedback')"
        @clickEditFeedback="$emit('clickEditFeedback')"
        @viewFeedback="$emit('handleViewFeedback')"
      />
      <NewEmojiButton
        :comment-id="commentData.id"
        @toggleEmojiPicker="toggleEmojiPicker"
      />
      <ReplyButton
        :show-reply-editor="!!replyFormOpenAtCommentID"
        :comment-data="commentData"
        :parent-comment-id="parentCommentId"
        :depth="depth"
        @click="$emit('openReplyEditor', commentData.id)"
      />
      <span
        v-if="showEditCommentField"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="$emit('hideEditCommentEditor')"
      >Cancel</span>
      <span
        v-if="showEditCommentField && !commentInProcess"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="
          () => {
            $emit('saveEdit');
            $emit('startCommentSave');
          }
        "
      >Save</span>
      <span
        v-if="showEditCommentField && commentInProcess"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
      >Saving...</span>
      <span
        v-if="commentData.DiscussionChannel"
        :to="`${route.path}/comments/${commentData.id}`"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="
          $router.push({
            name: 'DiscussionCommentPermalink',
            params: {
              channelId: commentData.DiscussionChannel?.channelUniqueName,
              discussionId: commentData.DiscussionChannel?.discussionId,
              commentId: commentData.id,
            },
          })
        "
      >
        Permalink
      </span>
      <span
        v-if="showReplies && replyCount > 0"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="$emit('hideReplies')"
      >
        {{ `Hide ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}` }}
      </span>
      <span
        v-if="!showReplies"
        class="cursor-pointer underline hover:text-black dark:text-gray-300 dark:hover:text-white"
        @click="$emit('showReplies')"
      >
        {{ `Show ${replyCount} ${replyCount === 1 ? "Reply" : "Replies"}` }}
      </span>
      <slot />
    </div>

    <div
      v-if="commentData && replyFormOpenAtCommentID === commentData.id"
      class="my-2 mt-1 w-full px-3 py-4 dark:bg-gray-700"
    >
      <TextEditor
        :placeholder="'Please be kind'"
        @update="
          $emit('updateNewComment', {
            text: $event,
            parentCommentId: commentData.id,
            depth: depth + 1,
          })
        "
      />
      <div class="mt-4 flex justify-start space-x-2">
        <CancelButton @click="$emit('hideReplyEditor')" />
        <SaveButton
          :loading="commentInProcess"
          :disabled="commentData?.text?.length === 0"
          @click.prevent="
            () => {
              $emit('createComment', parentCommentId);
              $emit('startCommentSave');
            }
          "
        />
      </div>
    </div>
  </div>
</template>
<style></style>
