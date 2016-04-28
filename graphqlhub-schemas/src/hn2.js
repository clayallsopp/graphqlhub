import {
  getItem,
  getUser,
  getTopStoryIds,
  getNewStoryIds,
  getAskStoryIds,
  getShowStoryIds,
  getJobStoryIds
} from './apis/hn';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLBoolean,
  GraphQLList,
  GraphQLID
} from 'graphql';

import {
  nodeDefinitions,
  fromGlobalId,
  toGlobalId,
  globalIdField,
  connectionDefinitions,
  connectionArgs,
  connectionFromPromisedArray
} from 'graphql-relay';

const itemTypeName = 'item';

const ConnectionTypes = {};
const getConnectionType = (nodeType) => {
  if (!ConnectionTypes[nodeType]) {
    ConnectionTypes[nodeType] = connectionDefinitions({ nodeType }).connectionType;
  }
  return ConnectionTypes[nodeType];
}

const kidsField = () => {
  return {
    type : getConnectionType(CommentType),
    description : 'The item\'s comments, in ranked display order.',
    args : connectionArgs,
    resolve : (item, args) => {
      // todo - trim initial kids array so we don't over-fetch
      let kidsPromise = Promise.all(item.kids.map(getItem))
      return connectionFromPromisedArray(kidsPromise, args)
    }
  };
};

const itemFields = () => {
  return {
    hnId : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The item\'s unique id.',
      resolve : (item) => item.id.toString()
    },
    id: globalIdField(itemTypeName),
    deleted : {
      type : GraphQLBoolean,
      description : 'if the item is deleted'
    },
    by : {
      type        : new GraphQLNonNull(UserType),
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
    parent : {
      type : nodeInterface,
      description : 'The item\'s parent. For comments, either another comment or the relevant story. For pollopts, the relevant poll.',
      resolve : (item) => {
        if (!item.parent) {
          return null;
        }
        return getItem(item.parent);
      }
    },

    descendants : {
      type : GraphQLInt,
      description : 'In the case of stories or polls, the total comment count.'
    }
  };
}

const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    if (type === 'HackerNewsV2User') {
      return getUser(id);
    }
    return getItem(id);
  },
  (obj) => {
    if (typeof obj.karma !== 'undefined') {
      return UserType;
    }
    return {
      job: JobType,
      story: StoryType,
      comment: CommentType,
      poll: PollType,
      pollopt: PollPartType,
    }[obj.type] || StoryType;
  }
);

const StoryType = new GraphQLObjectType({
  name: 'HackerNewsV2Story',
  fields: () => ({
    id: itemFields().id,
    hnId: itemFields().hnId,
    by: itemFields().by,
    descendants: itemFields().descendants,
    score: itemFields().score,
    time: itemFields().time,
    timeISO: itemFields().timeISO,
    title: itemFields().title,
    url: itemFields().url,
    text: itemFields().text,
    kids: kidsField(CommentType),
    deleted: itemFields().deleted,
    dead: itemFields().dead,
  }),
  interfaces: [nodeInterface]
});

const JobType = new GraphQLObjectType({
  name: 'HackerNewsV2Job',
  fields: () => ({
    id: itemFields().id,
    hnId: itemFields().hnId,
    by: itemFields().by,
    score: itemFields().score,
    text: itemFields().text,
    time: itemFields().time,
    timeISO: itemFields().timeISO,
    title: itemFields().title,
    url: itemFields().url,
    deleted: itemFields().deleted,
    dead: itemFields().dead,
  }),
  interfaces: [nodeInterface]
});

const PollType = new GraphQLObjectType({
  name: 'HackerNewsV2Poll',
  fields: () => ({
    id: itemFields().id,
    hnId: itemFields().hnId,
    by: itemFields().by,
    descendants: itemFields().descendants,
    score: itemFields().score,
    time: itemFields().time,
    timeISO: itemFields().timeISO,
    title: itemFields().title,
    text: itemFields().text,
    kids: kidsField(CommentType),
    deleted: itemFields().deleted,
    dead: itemFields().dead,
    parts : {
      type : new GraphQLList(PollPartType),
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
  }),
  interfaces: [nodeInterface]
});

const CommentType = new GraphQLObjectType({
  name: 'HackerNewsV2Comment',
  fields: () => ({
    id: itemFields().id,
    hnId: itemFields().hnId,
    by: itemFields().by,
    parent: itemFields().parent,
    text: itemFields().text,
    time: itemFields().time,
    timeISO: itemFields().timeISO,
    kids: kidsField(CommentType),
    deleted: itemFields().deleted,
    dead: itemFields().dead,
  }),
  interfaces: [nodeInterface]
});

const PollPartType = new GraphQLObjectType({
  name: 'HackerNewsV2PollPart',
  fields: () => ({
    id: itemFields().id,
    hnId: itemFields().hnId,
    by: itemFields().by,
    score: itemFields().score,
    time: itemFields().time,
    timeISO: itemFields().timeISO,
    text: itemFields().text,
    parent: itemFields().parent,
    deleted: itemFields().deleted,
  }),
  interfaces: [nodeInterface]
});

const UserType = new GraphQLObjectType({
  name: 'HackerNewsV2User',
  fields: () => ({
    id: globalIdField(),
    hnId: itemFields().hnId,
    delay : {
      type : GraphQLInt,
      description : 'Delay in minutes between a comment\'s creation and its visibility to other users.'
    },
    created : {
      type : GraphQLInt,
      description : 'Creation date of the user, in Unix Time.'
    },
    createdISO : {
      type : GraphQLString,
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
      type : getConnectionType(nodeInterface),
      description: 'List of the user\'s stories, polls and comments.',
      args : connectionArgs,
      resolve : (user, args) => {
        // todo - trim initial kids array so we don't over-fetch
        let promise = Promise.all(user.submitted.map(getItem))
        return connectionFromPromisedArray(promise, args)
      }
    }
  }),
  interfaces: [nodeInterface]
});


let hnType = new GraphQLObjectType({
  name : 'HackerNewsAPIV2',
  description : 'The Hacker News V2 API; this is Relay-compatible (uses Nodes and Connections)',
  fields : {
    node: nodeField,

    nodeFromHnId: {
      type: new GraphQLNonNull(nodeInterface),
      description: 'To ensure Node IDs are globally unique, GraphQLHub coerces ' +
      'IDs returned by the HN API. Use this field to get nodes via normal HN IDs',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString)
        },
        isUserId: {
          type: new GraphQLNonNull(GraphQLBoolean)
        }
      },
      resolve(source, args, context, info) {
        const typeName = args.isUserId ? UserType.name : itemTypeName;
        const id = toGlobalId(typeName, args.id);
        return nodeField.resolve(source, { id }, context, info);
      }
    }
  }
});

console.log(UserType);

export const QueryObjectType = hnType;
