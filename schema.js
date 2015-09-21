import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import HN from './schemas/hn';

let FIELDS = {
  hn : HN
};

let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name   : 'GraphQLHubAPI',
    description : 'APIs exposed as GraphQL',
    fields : () => FIELDS
  })
});

module.exports = schema;
