import {
  get,
  set
} from '../apis/keyvalue';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} from 'graphql';

let keyvalueType = new GraphQLObjectType({
  name : 'KeyValueAPI',
  description : 'An in-memory key-value store',
  fields : {
    valueForKey : {
      type : GraphQLString,
      args : {
        key : {
          description : 'key of the item',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { key }) {
        return get(key);
      }
    },

  }
});

let keyvalueMutationType = new GraphQLObjectType({
  name        : 'KeyValueMutation',
  description : 'Write to an in-memory key-value store',
  fields      : {
    setValueForKey: {
      type : GraphQLString,
      args : {
        key : {
          type : new GraphQLNonNull(GraphQLString)
        },
        value : {
          type: GraphQLString
        },
      },
      resolve : function(root, { key, value }) {
        set(key, value);
        return get(key);
      }
    }
  }
});

export const Schema = {
  query : {
    type    : keyvalueType,
    resolve() {
      return {};
    }
  },
  mutation : {
    type : keyvalueMutationType,
    resolve() {
      return {}
    }
  },
};
