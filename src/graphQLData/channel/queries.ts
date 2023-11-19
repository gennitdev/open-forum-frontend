import { gql } from "@apollo/client/core";

export const GET_CHANNEL_NAMES = gql`
  query getChannelNames($channelWhere: ChannelWhere) {
    channels(where: $channelWhere, options: { limit: 50 }) {
      uniqueName
      channelIconURL
    }
  }
`;

export const GET_CHANNEL = gql`
  query getChannel($uniqueName: String!, $now: DateTime, $cutoffDate: DateTime) {
    channels(where: { uniqueName: $uniqueName }) {
      uniqueName
      displayName
      description
      channelIconURL
      channelBannerURL
      Tags {
        text
      }
      Admins {
        username
        profilePicURL
        commentKarma
        discussionKarma
        createdAt
      }
      DiscussionChannelsAggregate {
        count
      }
      EventChannelsAggregate(
        where: {
          NOT: { Event: null }
          Event: { canceled: false, startTime_GT: $now }
        }
      ) {
        count
      }
      EventChannels(
        options: { limit: 6 }
        where: {
          OR: [
            { Event: { canceled: false, startTime_GT: $now, endTime_LT: $cutoffDate } }
            { Event: { canceled: false, startTime_LT: $now, endTime_GT: $now } }
          ]
        }
      ) {
        Event {
          id
          title
          startTime
          endTime
          virtualEventUrl
        }
      }
    }
  }
`;
export const GET_CHANNELS = gql`
  query getChannels(
    $channelWhere: ChannelWhere
    $eventChannelWhere: EventChannelWhere
    $limit: Int
    $offset: Int
    $sort: [ChannelSort!]
  ) {
    channelsAggregate(where: $channelWhere) {
      count
    }
    channels(
      where: $channelWhere
      options: { limit: $limit, offset: $offset, sort: $sort }
    ) {
      uniqueName
      displayName
      channelIconURL
      description
      Tags {
        text
      }
      EventChannelsAggregate(where: $eventChannelWhere) {
        count
      }
      DiscussionChannelsAggregate {
        count
      }
    }
  }
`;
