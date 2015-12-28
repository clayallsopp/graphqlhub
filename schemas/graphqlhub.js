import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { Schema as HN } from './hn';
import { Schema as REDDIT } from './reddit';

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

export let Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name   : 'GraphQLHubAPI',
    description : 'APIs exposed as GraphQL',
    fields : () => FIELDS
  })
});
