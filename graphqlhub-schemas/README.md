# graphqlhub-schemas

```
$ npm i graphqlhub-schemas --save

import { Schema as RedditSchema } from 'graphqlhub-schemas/reddit';
import { GraphQLSchema } from 'graphql';
import graphqlHTTP from 'express-graphql';

let schema = new GraphQLSchema({
  query: RedditSchema.query
});

app.use('/graphql', graphqlHTTP({ schema }));
```

## Available schemas

Each schema file exports an object that looks like:

```
import { Schema } from SCHEMA_FILE;

let { query } = Schema;
let { type, resolve } = query;
// type is a GraphQLObjectType
// resolve is an empty function
```

- `'graphqlhub-schemas/reddit'`
- `'graphqlhub-schemas/github'`
- `'graphqlhub-schemas/twitter'`
- `'graphqlhub-schemas/hn'`
