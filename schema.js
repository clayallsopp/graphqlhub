import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import HN from './schemas/hn';

let FIELDS = {
  hn : HN,
  graphQLHub : {
    type : GraphQLString,
    description : 'About GraphQLHub',
    resolve() {
      return 'GraphQLHub is created by Clay Allsopp @clayallsopp. Use it to explore popular APIs with GraphQL!'
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
