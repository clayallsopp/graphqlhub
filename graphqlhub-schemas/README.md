# graphqlhub-schemas

A collection of GraphQL schemas for existing HTTP APIs.

## Usage

```
$ npm i graphqlhub-schemas --save

import { Reddit } from 'graphqlhub-schemas';
import { GraphQLSchema, graphql } from 'graphql';

let schema = new GraphQLSchema({
  query: Reddit.QueryObjectType
});

let query = ' { user(username: "kn0thing") { username } } ';
graphql(schema, query).then((result) => {
  console.log(result);
});
```

## Available schemas

Each schema file exports an object that looks like:

```
import { <Schema> as Schema } from 'graphqlhub-schemas';

let { QueryObjectType } = Schema;
// QueryObjectType is an instance of GraphQLObjectType
```

See [src/index.js](src/index.js) from available schemas.
