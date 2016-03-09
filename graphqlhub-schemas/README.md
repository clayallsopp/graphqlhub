# graphqlhub-schemas

```
$ npm i graphqlhub-schemas --save

import { Reddit } from 'graphqlhub-schemas';
import { GraphQLSchema, graphql } from 'graphql';

let schema = new GraphQLSchema({
  query: Reddit.query.type
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

let { query } = Schema;
let { type } = query;
// type is a GraphQLObjectType
```

See [src/index.js](src/index.js) from available schemas.
