import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

import * as HN from './hn';
import * as REDDIT from './reddit';
import * as KEYVALUE from './keyvalue';
import * as GITHUB from './github';
import * as TWITTER from './twitter';
import * as GIPHY from './giphy';
import * as FACEBOOK from './facebook';

let schemas = {
  hn : HN,
  reddit : REDDIT,
  keyValue : KEYVALUE,
  github : GITHUB,
  twitter: TWITTER,
  giphy: GIPHY,
  facebook: FACEBOOK,
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
  let { Mutations } = schemas[schemaName];
  let mutations = Mutations;
  if (mutations) {
    Object.keys(mutations).forEach((mutationName) => {
      let fixedName = `${schemaName}_${mutationName}`;
      MUTATION_FIELDS[fixedName] = mutations[mutationName];
    });
  }
  FIELDS[schemaName] = {
    type : schemas[schemaName].QueryObjectType,
    args : schemas[schemaName].QueryArgsType,
    resolve() {
      return {};
    }
  };
});

let queryObjectType = new GraphQLObjectType({
  name   : 'GraphQLHubAPI',
  description : 'APIs exposed as GraphQL',
  fields : () => FIELDS,
});

let mutationsType = new GraphQLObjectType({
  name : 'GraphQLHubMutationAPI',
  description : 'APIs exposed as GraphQL mutations',
  fields : () => MUTATION_FIELDS,
});

export const QueryObjectType = queryObjectType;
export const MutationsType = mutationsType;
