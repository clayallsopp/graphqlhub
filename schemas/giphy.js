import giphy from '../apis/giphy';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLEnumType,
} from 'graphql';

let gifDataType = new GraphQLObjectType({
  name : 'GiphyGIFData',
  fields: {
    id : {
      type : new GraphQLNonNull(GraphQLString),
      description : 'The item\'s unique id.'
    },
  },
});

let giphyType = new GraphQLObjectType({
  name : 'GiphyAPI',
  fields : {
    getGIF : {
      type : gifDataType,
      args : {
        id : {
          description : 'id of the item',
          type: new GraphQLNonNull(GraphQLString),
        }
      },
      resolve: function(root, { id }) {
        return giphy.id(id);
      }
    },

  }
});

export const Schema = {
  query : {
    type    : giphyType,
    resolve() {
      return {};
    }
  },
};
