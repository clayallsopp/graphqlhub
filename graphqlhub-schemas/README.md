# graphqlhub-schemas

```
$ npm i graphqlhub-schemas --save

import { Reddit } from 'graphqlhub-schemas';
import { GraphQLSchema } from 'graphql';
import graphqlHTTP from 'express-graphql';

let schema = new GraphQLSchema({
  query: Reddit.query
});

app.use('/graphql', graphqlHTTP({ schema }));
```

## Available schemas

Each schema file exports an object that looks like:

```
import { <Schema> as Schema } from 'graphqlhub-schemas';

let { query } = Schema;
let { type, resolve } = query;
// type is a GraphQLObjectType
// resolve is an empty function
```

See [src/index.js](src/index.js) from available schemas.
