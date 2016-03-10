var graphqlhubSchemas = require('../');

var Reddit = graphqlhubSchemas.Reddit;

var _graphql = require('../../node_modules/graphql');

var GraphQLSchema = _graphql.GraphQLSchema;
var GraphQLObjectType = _graphql.GraphQLObjectType;
var graphql = _graphql.graphql;

var schema = new GraphQLSchema({
  query: Reddit.query.type
});

var query = ' { user(username: "kn0thing") { username }  }';
graphql(schema, query).then(function(result) {
  console.log(result);
});
