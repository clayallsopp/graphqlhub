import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { Schema as HN } from './hn';
import { Schema as REDDIT } from './reddit';
import { Schema as KEYVALUE } from './keyvalue';

let FIELDS = {
  hn : HN.query,
  reddit : REDDIT.query,
  keyValue : KEYVALUE.query,
  graphQLHub : {
    type : GraphQLString,
    description : 'About GraphQLHub',
    resolve() {
      return 'Use GraphQLHub to explore popular APIs with GraphQL! Created by Clay Allsopp @clayallsopp'
    }
  }
};

let MUTATION_FIELDS = {
  keyValue : KEYVALUE.mutation,
};

export let Schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name   : 'GraphQLHubAPI',
    description : 'APIs exposed as GraphQL',
    fields : () => FIELDS,
  }),
  mutation: new GraphQLObjectType({
    name : 'GraphQLHubMutationAPI',
    description : 'APIs exposed as GraphQL mutations',
    fields : () => MUTATION_FIELDS,
  }),
});
