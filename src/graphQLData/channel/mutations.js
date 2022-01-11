import { gql } from "@apollo/client/core";

export const ADD_CHANNEL = gql`
  mutation addChannel(
    $url: String!
    $name: String!
    $description: String
    $username: String!
  ) {
    addChannel(
      input: [
        {
          description: $description
          name: $name
          url: $url
          Posters: [{ username: $username }]
        }
      ]
    ) {
      channel {
        description
        name
        url
        Posters {
          username
        }
      }
    }
  }
`;


export const DELETE_CHANNEL = gql`
  mutation deleteChannel($url: String!) {
    deleteChannel(filter: { url: { eq: $url } }) {
      channel {
        url
      }
    }
  }
`;

export const UPDATE_CHANNEL = gql`
  mutation updateChannel($url: String!, $name: String, $description: String) {
    updateChannel(
      input: {
        filter: { url: { eq: $url } }
        set: { name: $name, description: $description }
      }
    ) {
      channel {
        url
        name
        description
      }
    }
  }
`;

export const ADD_CHANNEL_TAG = gql`
  mutation updateChannel(
      $url: String!,
      $text: String!, # text of the tag
    ) {
    updateChannel(
      input: { 
        filter: { 
          url: [$url] 
        }, 
        set: { 
          Tags: [{
            text: $text,
          }]
        }
      }
    ) {
      channel {
        url
        name
        description
        Tags {
          text
        }
      }
    }
}`;



export const REMOVE_CHANNEL_TAG = gql`
  mutation updateChannel (
      $url: String!,
      $text: String!
    ) {
      updateChannel(
        input: {
          filter: {
            id: [$commentId]
          }
          remove: { 
            Tags: {
              text: $text
            } 
          }
      }){
          channel {
            url
            name
            description
            Tags {
              text
            }
          }
      }
  }
`