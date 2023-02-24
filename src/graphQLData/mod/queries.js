import { gql } from '@apollo/client/core';

export const GET_MOD = gql`
  query getMod($displayName: String!) {
    moderationProfiles(where: {
      displayName: $displayName
    }) {
      displayName
      createdAt
      DownvotedCommentsAggregate {
        count
        __typename
      }
      DownvotedDiscussionsAggregate {
        count
        __typename
      }
      AuthoredReportsAggregate {
        count
        __typename
      } 
    }
  }`

export const GET_MOD_DOWNVOTED_COMMENTS = gql`
query getModDownvotedComments($displayName: String!) {
  moderationProfiles(
    where: {displayName: $displayName}
  ) {
    displayName
    DownvotedComments {
      id
      text
      createdAt
      updatedAt
      deleted
      CommentAuthor {
        ... on User {
          username
        }
      }
      Channel {
        uniqueName
      }
      UpvotedByUsersAggregate {
        count
      }
      UpvotedByUsers {
        username
      }
      DownvotedByModeratorsAggregate {
        count
      }
      DownvotedByModerators {
        displayName
      }
    }
  }
}`

export const GET_MOD_DOWNVOTED_DISCUSSIONS = gql`
query getModDownvotedDiscussions($displayName: String!) {
  moderationProfiles(
    where: {displayName: $displayName}
  ) {
    displayName
    DownvotedDiscussions {
      id
      title
      body
      createdAt
      updatedAt
      deleted
      Channel {
        uniqueName
      }
    }
  }
}
`