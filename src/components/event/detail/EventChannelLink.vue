<script lang="ts">
import { defineComponent } from "vue";
import Avatar from "@/components/user/Avatar.vue";

export default defineComponent({
  name: "ChannelLink",
  components: {
    Avatar,
  },
  props: {
    eventId: {
      type: String,
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    channelIcon: {
      type: String,
      required: true,
    },
    channelDisplayName: {
      type: String,
      required: true,
    },
    commentCount: {
      type: Number,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
<template>
  <router-link
    :to="{
      name: 'EventDetail',
      params: {
        eventId,
        channelId,
      },
    }"
  >
    <li
      class="flex items-center gap-3 rounded-md bg-gray-100 px-4 py-2 dark:bg-gray-700"
    >
      <Avatar
        class="h-24 w-24 border-2 shadow-sm dark:border-gray-800"
        :text="channelId"
        :src="channelIcon ?? ''"
        :is-small="true"
        :is-square="false"
      />
      <div class="flex-col space-y-1 text-xs">
        <div
          v-if="channelDisplayName"
          class="font-bold"
        >
          {{ channelDisplayName }}
        </div>
        <div
          :class="[channelDisplayName ? 'font-mono' : 'font-mono font-bold']"
        >
          {{ channelId }}
        </div>
      </div>
    </li>
  </router-link>
</template>
