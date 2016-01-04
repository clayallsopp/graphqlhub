# GraphQLHub Server [![Build Status](https://travis-ci.org/clayallsopp/graphqlhub.svg)](https://travis-ci.org/clayallsopp/graphqlhub)

This powers the server behind [GraphQLHub](http://www.graphqlhub.com/). It's basically:

- The GraphQL Schemas and fetching code for each API
- A slightly forked version of [GraphiQL](https://github.com/graphql/graphiql)

## Schemas

- [Hacker News](schemas/hn.js)
- [Reddit](schemas/reddit.js)
- [GitHub](schemas/github.js)
- [GraphQLHub](schemas/graphqlhub.js), which contains all the other schemas

## TODO

- Better visual design
- Add more APIs!
- Extract the schemas into their own repo, so others can easily drop them into their own projects
- Use GraphiQL from NPM, not the vendoring thing done now

PRs for anything above would be excellent!
