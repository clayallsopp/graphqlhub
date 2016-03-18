import {
  get,
  set
} from './apis/keyvalue';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLEnumType,
} from 'graphql';

import {
  mutationWithClientMutationId
} from 'graphql-relay'

let itemType = new GraphQLObjectType({
  name : 'KeyValueItem',
  description : 'Item for a key-value pair',
  fields: {
    id : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The item\'s unique id.',
      resolve : (item) => item.id.toString()
    },
    value : {
      type : GraphQLString,
      description : 'The item\'s value.',
      resolve : (item) => item.value
    },
  },
});

let getValueItem = (id) => {
  let value = get(id);
  return {
    id,
    value,
  };
};

let keyvalueType = new GraphQLObjectType({
  name : 'KeyValueAPI',
  description : 'An in-memory key-value store',
  fields : {
    getValue : {
      type : itemType,
      args : {
        id : {
          description : 'id of the item',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { id }) {
        return getValueItem(id);
      }
    },

  }
});

let SetValueReturnType = new GraphQLObjectType({
  name : 'SetValueReturnType',
  fields : {
    item : {
      type : itemType,
      resolve: (root) => {
        return root;
      }
    }
  }
})

let SetValueForKeyMutation = mutationWithClientMutationId({
  name : 'SetValueForKey',
  inputFields : {
    id : {
      type : new GraphQLNonNull(GraphQLString)
    },
    value : {
      type : new GraphQLNonNull(GraphQLString)
    },
  },
  outputFields : {
    item : {
      type : itemType,
      resolve: ({ id }) => {
        return getValueItem(id);
      }
    }
  },
  mutateAndGetPayload: ({ id, value }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        set(id, value);
        resolve({ id });
      }, 2 * 1000);
    });
  }
});

let mutations = {
  setValue: SetValueForKeyMutation
};

export const QueryObjectType = keyvalueType;
export const Mutations = mutations;
