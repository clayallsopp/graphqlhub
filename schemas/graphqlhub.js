import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import { Schema as HN } from './hn';
import { Schema as REDDIT } from './reddit';
import { Schema as KEYVALUE } from './keyvalue';

let schemas = {
  hn : HN,
  reddit : REDDIT,
  keyValue : KEYVALUE,
};

let FIELDS = {
  graphQLHub : {
    type : GraphQLString,
    description : 'About GraphQLHub',
    resolve() {
      return 'Use GraphQLHub to explore popular APIs with GraphQL! Created by Clay Allsopp @clayallsopp'
    }
  }
};
let MUTATION_FIELDS = {};

Object.keys(schemas).forEach((schemaName) => {
  let { mutations } = schemas[schemaName];
  if (mutations) {
    Object.keys(mutations).forEach((mutationName) => {
      let fixedName = `${schemaName}_${mutationName}`;
      MUTATION_FIELDS[fixedName] = mutations[mutationName];
    });
  }
  FIELDS[schemaName] = schemas[schemaName].query;
});

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
