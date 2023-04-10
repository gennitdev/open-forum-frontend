<script lang="ts">
import { defineComponent, computed, PropType, ref } from "vue";
import { DiscussionData } from "@/types/discussionTypes";
import { useMutation } from "@vue/apollo-composable";
import GenericButton from "../../generic/GenericButton.vue";
import RequireAuth from "@/components/auth/RequireAuth.vue";
import { useRoute, useRouter } from "vue-router";
import { relativeTime } from "@/dateTimeUtils";
import { DateTime } from "luxon";
import { DELETE_DISCUSSION } from "@/graphQLData/discussion/mutations";
import WarningModal from "../../generic/WarningModal.vue";
import ErrorBanner from "../../generic/ErrorBanner.vue";

export default defineComponent({
  components: {
   
    ErrorBanner,
    GenericButton,
    
    RequireAuth,
    WarningModal,
  },
  props: {
    discussion: {
      type: Object as PropType<DiscussionData>,
      required: true,
    },
    compactMode: {
      type: Boolean,
      required: false,
      default: false,
    },
    channelId: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();

    const editedAt = computed(() => {
      if (!props.discussion.updatedAt) {
        return "";
      }
      return `Edited ${relativeTime(props.discussion.updatedAt)}`;
    });

    const createdAt = computed(() => {
      return `posted ${relativeTime(props.discussion.createdAt)}`;
    });

    const {
      mutate: deleteDiscussion,
      error: deleteDiscussionError,
      onDone: onDoneDeleting,
    } = useMutation(DELETE_DISCUSSION, {
      variables: {
        id: props.discussion.id,
      },
      update: (cache: any) => {
        cache.modify({
          fields: {
            discussions(existingDiscussionRefs = [], fieldInfo: any) {
              const readField = fieldInfo.readField;

              return existingDiscussionRefs.filter((ref) => {
                return readField("id", ref) !== props.discussion.id;
              });
            },
          },
        });
      },
    });

    onDoneDeleting(() => {
      if (props.channelId) {
        router.push({
          name: "SearchDiscussionsInChannel",
          params: {
            channelId: props.channelId,
          },
        });
      }
    });

    const deleteModalIsOpen = ref(false);
    return {
      createdAt,
      deleteModalIsOpen,
      deleteDiscussion,
      deleteDiscussionError,
      editedAt,
      route,
      router,
    };
  },
  methods: {
    getFormattedDateString(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.toFormat("cccc LLLL d yyyy");
    },
  },
});
</script>

<template>
  <div class="mb-4">
    <div class="flex-1 min-w-0">
      <h1 class="md:flex md:items-center md:justify-between">
        {{ discussion.title }}
      </h1>
      <span>
        <RequireAuth
          class="flex inline-flex"
          v-if="discussion.Author && route.name === 'DiscussionDetail'"
          :require-ownership="true"
          :owners="[discussion.Author.username]"
        >
          <template v-slot:has-auth>
            <router-link
              :to="`/channels/c/${channelId}/discussions/d/${discussion.id}/edit`"
            >
              <GenericButton :text="'Edit'" />
            </router-link>
          </template>
        </RequireAuth>
      </span>
    </div>
    <div class="text-xs text-gray-600 mt-4">
      <div class="mb-2 mt-4">
        <router-link
          v-if="discussion.Author"
          class="text-blue-800 underline"
          :to="`/u/${discussion.Author.username}`"
        >
          {{ discussion.Author.username }}
        </router-link>
        <span v-else>[Deleted]</span>
        {{ createdAt }}
        <span v-if="discussion.updatedAt"> &#8226; </span>
        {{ editedAt }}

        <RequireAuth
          class="flex inline-flex"
          v-if="discussion.Author && route.name === 'DiscussionDetail'"
          :require-ownership="true"
          :owners="[discussion.Author.username]"
        >
          <template v-slot:has-auth>
            <span> &#8226;</span>
            <span
              class="ml-1 underline font-medium text-gray-900 cursor-pointer"
              @click="deleteModalIsOpen = true"
              >Delete</span
            >
          </template>
        </RequireAuth>

        <span
          v-if="route.name !== 'DiscussionDetail' && channelId"
          class="ml-1 mr-1"
          >&#8226;</span
        >
        <router-link
          v-if="route.name !== 'DiscussionDetail' && channelId"
          class="underline font-medium text-gray-900 cursor-pointer"
          :to="`/channels/c/${channelId}/discussions/d/${discussion.id}`"
          >Permalink</router-link
        >
      </div>
    </div>
    <WarningModal
      :title="'Delete Discussion'"
      :body="'Are you sure you want to delete this discussion?'"
      :open="deleteModalIsOpen"
      @close="deleteModalIsOpen = false"
      @primaryButtonClick="deleteDiscussion"
    />
    <ErrorBanner
      class="mt-2"
      v-if="deleteDiscussionError"
      :text="deleteDiscussionError.message"
    />
  </div>
</template>