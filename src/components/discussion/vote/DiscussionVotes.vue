<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { DiscussionData } from "../../../types/discussionTypes";
import { CommentSectionData } from "../../../types/commentTypes";
import { useRoute } from "vue-router";
import VoteButtons from "./VoteButtons.vue";
import {
  GET_LOCAL_MOD_PROFILE_NAME,
  GET_LOCAL_USERNAME,
} from "@/graphQLData/user/queries";
import { CREATE_COMMENT_SECTION } from "@/graphQLData/comment/mutations";
import { useQuery, useMutation } from "@vue/apollo-composable";
import {
  DOWNVOTE_DISCUSSION,
  UPVOTE_DISCUSSION,
  UNDO_UPVOTE_DISCUSSION,
  UNDO_DOWNVOTE_DISCUSSION,
  DOWNVOTE_COMMENT_SECTION,
  UPVOTE_COMMENT_SECTION,
  UNDO_UPVOTE_COMMENT_SECTION,
  UNDO_DOWNVOTE_COMMENT_SECTION,
} from "@/graphQLData/discussion/mutations";
import { GET_DISCUSSIONS_WITH_COMMENT_SECTION_DATA } from "@/graphQLData/discussion/queries";

export default defineComponent({
  props: {
    discussionQueryFilters: {
      type: Object as PropType<Object>,
      required: false
    },
    commentSection: {
      type: Object as PropType<CommentSectionData>,
      required: false
    },
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
  },
  components: {
    VoteButtons,
  },
  setup(props) {
    const route = useRoute();
    const channelIdInParams = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });
    const discussionIdInParams = computed(() => {
      if (typeof route.params.discussionId === "string") {
        return route.params.discussionId;
      }
      return "";
    });
    const defaultUniqueName = computed(() => {
      if (channelIdInParams.value) {
        return channelIdInParams.value;
      }
      return props.discussion.Channels[0].uniqueName;
    });

    const { result: localUsernameResult, loading: localUsernameLoading } =
      useQuery(GET_LOCAL_USERNAME);

    const {
      result: localModProfileNameResult,
      loading: localModProfileNameLoading,
      error: localModProfileNameError,
    } = useQuery(GET_LOCAL_MOD_PROFILE_NAME);

    const username = computed(() => {
      if (localUsernameLoading.value) {
        return "";
      }
      return localUsernameResult.value?.username || "";
    });

    const loggedInUserModName = computed(() => {
      if (localModProfileNameLoading.value || localModProfileNameError.value) {
        return "";
      }
      return localModProfileNameResult.value.modProfileName;
    });

    const { mutate: downvoteDiscussion, error: downvoteDiscussionError } =
      useMutation(DOWNVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          displayName: loggedInUserModName.value,
        },
      }));

    const { mutate: upvoteDiscussion, error: upvoteDiscussionError } =
      useMutation(UPVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          username: localUsernameResult.value?.username || "",
        },
      }));

    const { mutate: undoUpvoteDiscussion, error: undoUpvoteDiscussionError } =
      useMutation(UNDO_UPVOTE_DISCUSSION, () => ({
        variables: {
          id: props.discussion.id,
          username: localUsernameResult.value?.username || "",
        },
      }));

    const {
      mutate: undoDownvoteDiscussion,
      error: undoDownvoteDiscussionError,
    } = useMutation(UNDO_DOWNVOTE_DISCUSSION, () => ({
      variables: {
        id: props.discussion.id,
        displayName: localModProfileNameResult.value?.modProfileName || "",
      },
    }));

    const commentSectionId = computed(() => {
      return props.commentSection?.id || "";
    });

    const updateQueryResult = (cache: any, result: any) => {
      // when comment section is upvoted, update discussion in cache to add it there.
      // The query result has to be updated so that when the user clicks
      // upvote or downvote, the arrow will appear black, indicating that
      // the logged in user has clicked it. The score will also be updated
      // and highlighted.

      if (!props.discussionQueryFilters) {
        // If we are not on the discussion list view, we don't need to update the query result
        return;
      }

      cache.modify({
        fields: {
          discussions() {
            const newCommentSection =
              result.data.updateCommentSections.commentSections[0];

            // when comment section is created, update discussion in cache to add it there
            const readQueryResult = cache.readQuery({
              query: GET_DISCUSSIONS_WITH_COMMENT_SECTION_DATA,
              variables: {
                ...props.discussionQueryFilters,
              },
            });

            const existingDiscussions = readQueryResult?.discussions || [];

            const discussionToUpdate = existingDiscussions.find(
              (discussion: any) => discussion.id === discussionIdInParams.value
            );

            const existingCommentSections = discussionToUpdate.CommentSections;

            const newDiscussion = {
              ...discussionToUpdate,
              CommentSections: [...existingCommentSections, newCommentSection],
            };

            if (readQueryResult) {
              cache.writeQuery({
                query: GET_DISCUSSIONS_WITH_COMMENT_SECTION_DATA,
                data: {
                  ...readQueryResult,
                  discussions: [
                    ...existingDiscussions.filter(
                      (discussion: any) =>
                        discussion.id !== discussionIdInParams.value
                    ),
                    newDiscussion,
                  ],
                },
                variables: {
                  ...props.discussionQueryFilters,
                },
              });
            }
          },
        },
      });
    };

    const {
      mutate: downvoteCommentSection,
      error: downvoteCommentSectionError,
    } = useMutation(DOWNVOTE_COMMENT_SECTION, () => ({
      update: updateQueryResult,
    }));

    const { mutate: upvoteCommentSection, error: upvoteCommentSectionError } =
      useMutation(UPVOTE_COMMENT_SECTION, () => ({
        update: updateQueryResult,
      }));

    const {
      mutate: undoUpvoteCommentSection,
      error: undoUpvoteCommentSectionError,
    } = useMutation(UNDO_UPVOTE_COMMENT_SECTION, () => ({
      variables: {
        id: props.commentSection.id,
        username: localUsernameResult.value?.username || "",
      },
    }));

    const {
      mutate: undoDownvoteCommentSection,
      error: undoDownvoteCommentSectionError,
    } = useMutation(UNDO_DOWNVOTE_COMMENT_SECTION, () => ({
      variables: {
        id: props.commentSection.id,
        displayName: localModProfileNameResult.value?.modProfileName || "",
      },
    }));

    const { mutate: createCommentSection, error: createCommentSectionError } =
      useMutation(CREATE_COMMENT_SECTION, () => ({
        errorPolicy: "all",
        variables: {
          createCommentSectionInput: [
            {
              OriginalPost: {
                Discussion: {
                  connect: {
                    where: {
                      node: {
                        id: discussionIdInParams.value,
                      },
                    },
                  },
                },
              },
              Channel: {
                connect: {
                  where: { node: { uniqueName: channelIdInParams.value } },
                },
              },
            },
          ],
        },
      }));

    const loggedInUserUpvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !commentSectionId.value
      ) {
        return false;
      }
      const users = props.commentSection.UpvotedByUsers || [];

      const loggedInUser = localUsernameResult.value.username;
      const match =
        users.filter((user: any) => {
          return user.username === loggedInUser;
        }).length === 1;
      return match;
    });

    const loggedInUserDownvoted = computed(() => {
      if (
        localUsernameLoading.value ||
        !localUsernameResult.value ||
        !commentSectionId.value
      ) {
        return false;
      }
      const mods = props.commentSection.DownvotedByModerators || [];
      const loggedInMod = localModProfileNameResult.value.modProfileName;
      const match =
        mods.filter((mod: any) => {
          return mod.displayName === loggedInMod;
        }).length === 1;
      return match;
    });

    const downvoteCount = computed(() => {
      if (props.discussion.CommentSections[0]) {
        return props.discussion.CommentSections[0]
          .DownvotedByModeratorsAggregate?.count;
      }
      return 0;
    });

    const upvoteCount = computed(() => {
      if (props.discussion.CommentSections[0]) {
        return props.discussion.CommentSections[0].UpvotedByUsersAggregate
          ?.count;
      }
      return 0;
    });

    return {
      commentSectionId,
      createCommentSection,
      defaultUniqueName,
      discussionIdInParams,
      downvoteCount,
      loggedInUserUpvoted,
      loggedInUserDownvoted,
      loggedInUserModName,
      commentSectionMutations: {
        create: createCommentSectionError,
        upvote: upvoteCommentSection,
        downvote: downvoteCommentSection,
        undoUpvote: undoUpvoteCommentSection,
        undoDownvote: undoDownvoteCommentSection,
        errors: {
          upvote: upvoteCommentSectionError,
          downvote: downvoteCommentSectionError,
          undoUpvote: undoUpvoteCommentSectionError,
          undoDownvote: undoDownvoteCommentSectionError,
        },
      },
      discussionMutations: {
        upvote: upvoteDiscussion,
        downvote: downvoteDiscussion,
        undoUpvote: undoUpvoteDiscussion,
        undoDownvote: undoDownvoteDiscussion,
        errors: {
          upvote: upvoteDiscussionError,
          downvote: downvoteDiscussionError,
          undoUpvote: undoUpvoteDiscussionError,
          undoDownvote: undoDownvoteDiscussionError,
        },
      },
      upvoteCount,
      username,
      route,
    };
  },
  inheritAttrs: false,
  methods: {
    handleClickUp() {
      if (this.loggedInUserUpvoted) {
        this.undoUpvote();
      } else {
        this.upvote();
      }
    },
    handleClickDown() {
      if (this.loggedInUserModName) {
        if (!this.loggedInUserDownvoted) {
          this.downvote();
        } else {
          this.undoDownvote();
        }
      } else {
        // Create mod profile, then downvote comment
        // this.openModProfile()
      }
    },
    async downvote() {
      // Note: Voting in the sitewide discussion page is not allowed.
      // We only collect the sitewide votes for ranking purposes. It basically
      // shows the sum of all votes in all channels.
      this.discussionMutations.downvote(); // counts toward sitewide ranking

      if (!this.loggedInUserModName) {
        throw new Error("Username is required to downvote");
      }

      if (this.commentSection.id) {
        this.commentSectionMutations.downvote({
          id: this.commentSection.id,
          displayName: this.loggedInUserModName || "",
        }); // counts toward ranking within channel
      } else {
        const newCommentSection = await this.commentSectionMutations.create();
        const newCommentSectionId =
          newCommentSection.data.createCommentSections.commentSections[0].id;

        // We pass the variables in at the last minute
        // so that we can use the new comment section id
        // that was just created.
        this.commentSectionMutations.downvote({
          id: newCommentSectionId,
          displayName: this.loggedInUserModName || "",
        }); // counts toward ranking within channel
      }
    },
    async upvote() {
      this.discussionMutations.upvote(); // counts toward sitewide ranking

      if (!this.username) {
        throw new Error("Username is required to upvote");
      }

      if (this.commentSection.id) {
        this.commentSectionMutations.upvote({
          id: this.commentSectionId,
          username: this.username || "",
        }); // counts toward ranking within channel
      } else {
        const newCommentSection = await this.createCommentSection();
        const newCommentSectionId =
          newCommentSection.data.createCommentSections.commentSections[0].id;

        this.commentSectionMutations.upvote({
          // We pass the variables in at the last minute
          // so that we can use the new comment section id
          // that was just created.
          id: newCommentSectionId,
          username: this.username || "",
        }); // counts toward ranking within channel
      }
    },
    undoUpvote() {
      this.discussionMutations.undoUpvote(); // counts toward sitewide ranking
      this.commentSectionMutations.undoUpvote(); // counts toward ranking within channel
    },
    undoDownvote() {
      this.discussionMutations.undoDownvote(); // counts toward sitewide ranking
      this.commentSectionMutations.undoDownvote(); // counts toward ranking within channel
    },
  },
});
</script>

<template>
  <VoteButtons
    class="mx-2 my-1"
    :downvote-count="downvoteCount"
    :upvote-count="upvoteCount"
    :upvote-active="loggedInUserUpvoted"
    :downvote-active="loggedInUserDownvoted"
    :has-mod-profile="!!loggedInUserModName"
    @downvote="downvote"
    @upvote="upvote"
    @openModProfile="$emit('openModProfile')"
    @undoUpvote="undoUpvote"
    @undoDownvote="undoDownvote"
  />
</template>
<style>
.highlighted {
  background-color: #f9f95d;
}
</style>