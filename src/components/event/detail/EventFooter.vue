<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import { Event as EventData } from "@/__generated__/graphql";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import { relativeTime } from "@/dateTimeUtils";
import { EventChannel } from "@/__generated__/graphql";
import UsernameWithTooltip from "@/components/generic/UsernameWithTooltip.vue";

export default defineComponent({
  components: {
    UsernameWithTooltip,
  },
  props: {
    eventData: {
      type: Object as PropType<EventData>,
      required: true,
    },
    compactMode: {
      type: Boolean,
      default: false,
    },
    channelsExceptCurrent: {
      type: Array as PropType<EventChannel[]>,
      default: () => [],
    },
  },
  setup(props) {
    const route = useRoute();

    const eventId = computed(() => {
      if (typeof route.params.eventId === "string") {
        return route.params.eventId;
      }
      return "";
    });

    const channelId = computed(() => {
      if (typeof route.params.channelId === "string") {
        return route.params.channelId;
      }
      return "";
    });

    const posterIsAdmin = computed(() => {
      const serverRoles = props.eventData.Poster?.ServerRoles;
      if (!serverRoles) {
        return false;
      }
      if (serverRoles.length === 0) {
        return false;
      }
      const serverRole = serverRoles[0];
      if (serverRole.showAdminTag) {
        return true;
      }
      return false;
    });

    const posterIsMod = computed(() => {
      const channelRoles = props.eventData.Poster?.ChannelRoles;
      if (!channelRoles) {
        return false;
      }
      if (channelRoles.length === 0) {
        return false;
      }
      const channelRole = channelRoles[0];
      if (channelRole.showModTag) {
        return true;
      }
      return false;
    });

    return {
      channelId,
      posterIsMod,
      eventId,
      posterIsAdmin,
      relativeTime,
      route,
    };
  },
  methods: {
    getTimeZone(startTime: string) {
      const startTimeObj = DateTime.fromISO(startTime);

      return startTimeObj.zoneName;
    },
  },
});
</script>
<template>
  <div class="mt-4 px-4 text-xs text-gray-700 dark:text-gray-200">
    <div class="organizer flex items-center gap-1">
      <router-link
        v-if="eventData.Poster"
        class="underline"
        :to="`/u/${eventData.Poster.username}`"
      >
        <UsernameWithTooltip
          v-if="eventData.Poster.username"
          :is-admin="posterIsAdmin"
          :is-mod="posterIsMod"
          :username="eventData.Poster.username"
          :src="eventData.Poster.profilePicURL ?? ''"
          :display-name="eventData.Poster.displayName || ''"
          :comment-karma="eventData.Poster.commentKarma ?? 0"
          :discussion-karma="eventData.Poster.discussionKarma ?? 0"
          :account-created="eventData.Poster.createdAt"
        />
      </router-link>
      <span v-else>[Deleted]</span>
      {{
        `${
          eventData.createdAt
            ? `posted this event ${relativeTime("" + eventData.createdAt)}`
            : ""
        }`
      }}
      <span v-if="eventData.updatedAt"> &#8226; </span>
      {{
        eventData.updatedAt
          ? `Edited ${relativeTime("" + eventData.updatedAt)}`
          : ""
      }}
    </div>
    <div class="time-zone">
      {{ `Time zone: ${getTimeZone(eventData.startTime)}` }}
    </div>
    <p
      v-if="!eventData.virtualEventUrl && !eventData.address"
      class="xs"
    >
      This event won't show in site-wide search results because it doesn't have
      a location or a virtual event URL. It will only appear in channel specific
      search results.
    </p>
  </div>
</template>
