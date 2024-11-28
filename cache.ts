import type { InMemoryCacheConfig, ReactiveVar } from "@apollo/client/core";
import { makeVar } from "@apollo/client/core";
import { ref } from "vue";

export const usernameVar = ref("");
export const setUsername = (username: string) => {
  usernameVar.value = username;
};
export const modProfileNameVar = ref("default");
export const setModProfileName = (modProfileName: string) => {
  modProfileNameVar.value = modProfileName;
};
export const isAuthenticatedVar = ref(false);
export const setIsAuthenticated = (status: boolean) => {
  isAuthenticatedVar.value = status;
};

export const isLoadingAuthVar = ref(false);
export const setIsLoadingAuth = (status: boolean) => {
  isLoadingAuthVar.value = status;
};
export const themeVar: ReactiveVar<string> = makeVar<string>(
  import.meta.client ? localStorage.getItem("theme") || "dark" : "dark"
);

export const inMemoryCacheOptions: InMemoryCacheConfig = {
  typePolicies: {
    Tag: {
      merge: true,
      keyFields: ["text"],
    },
    Channel: {
      keyFields: ["uniqueName"],
      merge: true,
      fields: {
        Tags: {
          merge: (existing = [], incoming) => [...incoming]
        },
        Admins: {
          merge: (existing = [], incoming) => [...incoming]
        }
      }
    },
    Discussion: {
      keyFields: ["id"],
      merge: true,
      fields: {
        Tags: {
          merge: (existing = [], incoming) => [...incoming]
        },
        DiscussionChannels: {
          merge: (existing = [], incoming) => [...incoming]
        },
        Author: {
          merge: true
        },
        Channel: {
          merge: true
        }
      }
    },
    Comment: {
      keyFields: ["id"],
      merge: true,
      fields: {
        CommentAuthor: {
          merge: true
        },
        UpvotedByUsers: {
          merge: (existing = [], incoming) => [...incoming]
        },
        FeedbackComments: {
          merge: (existing = [], incoming) => [...incoming]
        }
      }
    },
    Event: {
      keyFields: ["id"],
      merge: true,
      fields: {
        Tags: {
          merge: (existing = [], incoming) => [...incoming]
        },
        Channels: {
          merge: (existing = [], incoming) => [...incoming]
        },
        Poster: {
          merge: true
        }
      }
    },
    DiscussionChannel: {
      merge: true,
      fields: {
        UpvotedByUsers: {
          merge: (existing = [], incoming) => [...incoming]
        },
        Channel: {
          merge: true
        },
        Comments: {
          merge: (existing = [], incoming) => [...incoming]
        }
      }
    },
    User: {
      keyFields: ["username"],
      merge: true,
      fields: {
        Discussions: {
          merge: (existing = [], incoming) => [...incoming]
        },
        Comments: {
          merge: (existing = [], incoming) => [...incoming]
        },
        Events: {
          merge: (existing = [], incoming) => [...incoming]
        },
        UpvotedComments: {
          merge: (existing = [], incoming) => [...incoming]
        },
        UpvotedDiscussions: {
          merge: (existing = [], incoming) => [...incoming]
        },
        UpvotedEvents: {
          merge: (existing = [], incoming) => [...incoming]
        },
        SubscribedChannels: {
          merge: (existing = [], incoming) => [...incoming]
        },
        SubscribedTags: {
          merge: (existing = [], incoming) => [...incoming]
        },
        ModProfiles: {
          merge: (existing = [], incoming) => [...incoming]
        },
        ChannelRoles: {
          merge: (existing = [], incoming) => [...incoming]
        }
      }
    },
    ChannelRole: {
      keyFields: ["channelUniqueName"],
      merge: true
    },
    Query: {}
  }
};