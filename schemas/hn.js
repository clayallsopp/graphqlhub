import {
  getItem,
  getUser,
  getTopStoryIds,
  getNewStoryIds,
  getAskStoryIds,
  getShowStoryIds,
  getJobStoryIds
} from '../apis/hn';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

let getItems = function(ids, { offset, limit }) {
  if (!ids) {
    ids = [];
  }
  let promises = (ids.slice(offset, offset + limit)).map((id) => {
    return getItem(id)
  });
  return Promise.all(promises);
}

let itemTypeEnum = new GraphQLEnumType({
  name: 'ItemType',
  description: 'The type of item',
  values: {
    job: {
      value: 'job'
    },
    story: {
      value: 'story'
    },
    comment: {
      value: 'comment'
    },
    poll: {
      value: 'poll'
    },
    pollopt: {
      value: 'pollopt'
    }
  }
});

let storyListTypeEnum = new GraphQLEnumType({
  name : 'StoryListType',
  description : 'The type of story list',
  values : {
    ask : {
      value : 'ask'
    },
    show : {
      value : 'show'
    },
    top : {
      value : 'top'
    },
    jobs : {
      value : 'jobs'
    },
    new : {
      value : 'new'
    }
  }
})

let itemType = new GraphQLObjectType({
  name : 'HackerNewsItem',
  description : 'Stories, comments, jobs, Ask HNs and even polls are just items. They\'re identified by their ids, which are unique integers',
  fields: () => ({
    id : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The item\'s unique id.',
      resolve : (item) => item.id.toString()
    },
    deleted : {
      type : GraphQLBoolean,
      description : 'if the item is deleted'
    },
    type : {
      type : new GraphQLNonNull(itemTypeEnum),
      description: 'The type of item. One of "job", "story", "comment", "poll", or "pollopt".'
    },
    by : {
      type        : new GraphQLNonNull(userType),
      description : 'The item\'s author.',
      resolve : (item) => {
        return getUser(item.by);
      }
    },
    time : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Creation date of the item, in Unix Time.'
    },
    timeISO : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'Creation date of the item, in ISO8601',
      resolve : (item) => {
        let date = new Date(item.time * 1000);
        return date.toISOString();
      }
    },
    text : {
      type : GraphQLString,
      description : 'The comment, story or poll text. HTML.'
    },
    dead : {
      type : GraphQLBoolean,
      description : 'if the item is dead'
    },
    url : {
      type : GraphQLString,
      description : 'The URL of the story.'
    },
    score : {
      type : GraphQLInt,
      description : 'The story\'s score, or the votes for a pollopt.'
    },
    title : {
      type : GraphQLString,
      description : 'The title of the story, poll or job.'
    },
    kids : {
      type : new GraphQLList(itemType),
      description : 'The item\'s comments, in ranked display order.',
      args : {
        limit : {
          description : 'Number of items to return',
          type        : GraphQLInt,
        },
        offset : {
          description : 'Initial offset of number of items to return',
          type        : GraphQLInt,
        }
      },
      resolve : (item, { offset = 0, limit = 10 } = {}) => {
        return getItems(item.kids, { offset, limit });
      }
    },
    parent : {
      type : itemType,
      description : 'The item\'s parent. For comments, either another comment or the relevant story. For pollopts, the relevant poll.',
      resolve : (item) => {
        if (!item.parent) {
          return null;
        }
        return getItem(item.parent);
      }
    },
    parts : {
      type : new GraphQLList(itemType),
      description : 'A list of related pollopts, in display order.',
      resolve : (item) => {
        if (!item.parts) {
          return null;
        }
        let promises = item.parts.map((partId) => {
          return getItem(partId)
        });
        return Promise.all(promises);
      }
    },
    descendants : {
      type : GraphQLInt,
      description : 'In the case of stories or polls, the total comment count.'
    }
  })
});

let userType = new GraphQLObjectType({
  name : 'HackerNewsUser',
  description : 'Users are identified by case-sensitive ids. Only users that have public activity (comments or story submissions) on the site are available through the API.',
  fields : {
    id : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The user\'s unique username. Case-sensitive. Required.'
    },
    delay : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Delay in minutes between a comment\'s creation and its visibility to other users.'
    },
    created : {
      type : new GraphQLNonNull(GraphQLInt),
      description : 'Creation date of the user, in Unix Time.'
    },
    createdISO : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'Creation date of the user, in ISO8601',
      resolve : (user) => {
        let date = new Date(user.created * 1000);
        return date.toISOString();
      }
    },
    about : {
      type : GraphQLString,
      description : 'The user\'s optional self-description. HTML.'
    },
    submitted : {
      type : new GraphQLList(itemType),
      description: 'List of the user\'s stories, polls and comments.',
      args : {
        limit : {
          description : 'Number of items to return',
          type        : GraphQLInt,
        },
        offset : {
          description : 'Initial offset of number of items to return',
          type        : GraphQLInt,
        }
      },
      resolve : (user, { limit = 10, offset = 0 } = {}) => {
        let submitted = user.submitted;
        return getItems(submitted, { limit, offset });
      }
    }
  }
});

let createBulkType = function(bulkAPICall, description) {
  return {
    type : new GraphQLList(itemType),
    description,
    args : {
      limit : {
        description : 'Number of items to return',
        type        : GraphQLInt,
      },
      offset : {
        description : 'Initial offset of number of items to return',
        type        : GraphQLInt,
      }
    },
    resolve: function(root, { limit = 30, offset = 0 } = {}) {
      return bulkAPICall().then((ids) => {
        return getItems(ids, { limit, offset });
      });
    }
  }
}

let hnType = new GraphQLObjectType({
  name : 'HackerNewsAPI',
  description : 'The Hacker News V0 API',
  fields : {
    item : {
      type : itemType,
      args : {
        id : {
          description : 'id of the item',
          type: new GraphQLNonNull(GraphQLInt),
        }
      },
      resolve: function(root, { id }) {
        return getItem(id);
      }
    },
    user : {
      type: userType,
      args : {
        id : {
          description : 'id of the user',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { id }) {
        return getUser(id);
      }
    },
    topStories  : createBulkType(getTopStoryIds, 'Up to 500 of the top stories'),
    newStories  : createBulkType(getNewStoryIds, 'Up to 500 of the newest stories'),
    showStories : createBulkType(getShowStoryIds, 'Up to 200 of the Show HN stories'),
    askStories  : createBulkType(getAskStoryIds, 'Up to 200 of the Ask HN stories'),
    jobStories  : createBulkType(getJobStoryIds, 'Up to 200 of the Job stores'),
    stories : {
      type : new GraphQLList(itemType),
      description : 'Return list of stories',
      args : {
        limit : {
          description : 'Number of items to return',
          type        : GraphQLInt,
        },
        offset : {
          description : 'Initial offset of number of items to return',
          type        : GraphQLInt,
        },
        storyType : {
          description : 'Type of story to list',
          type        : new GraphQLNonNull(storyListTypeEnum)
        }
      },
      resolve: function(root, { limit = 30, offset = 0, storyType } = {}) {
        let bulkAPICall = {
          top  : getTopStoryIds,
          show : getShowStoryIds,
          new  : getNewStoryIds,
          ask  : getAskStoryIds,
          job  : getJobStoryIds
        }[storyType];
        return bulkAPICall().then((ids) => {
          return getItems(ids, { limit, offset });
        });
      }
    }
  }
})

let SCHEMA = {
  type : hnType,
  resolve() {
    return {};
  }
};

module.exports = SCHEMA;
