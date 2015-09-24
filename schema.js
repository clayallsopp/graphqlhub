import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import HN from './schemas/hn';
import REDDIT from './schemas/reddit';

let FIELDS = {
  hn : HN,
  reddit : REDDIT,
  graphQLHub : {
    type : GraphQLString,
    description : 'About GraphQLHub',
    resolve() {
      return 'Use GraphQLHub to explore popular APIs with GraphQL! Created by Clay Allsopp @clayallsopp'
    }
  }
};

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name   : 'GraphQLHubAPI',
    description : 'APIs exposed as GraphQL',
    fields : () => FIELDS
  })
});

module.exports = schema;
