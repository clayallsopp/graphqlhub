<p align="center">
  <img src="public/images/graphqlhub-logo.png" alt="GraphQLHub Logo" width="305" height="300"/>
</p>

# GraphQLHub Schemas

Want to install the various GraphQLHub schemas and use on your own? See [graphqlhub-schemas](./graphqlhub-schemas) for details.

# GraphQLHub Server [![Build Status](https://travis-ci.org/clayallsopp/graphqlhub.svg)](https://travis-ci.org/clayallsopp/graphqlhub)

This powers the server behind [GraphQLHub](http://www.graphqlhub.com/). It's basically:

- The GraphQL Schemas and fetching code for each API
- A slightly forked version of [GraphiQL](https://github.com/graphql/graphiql)

> Try the [live app here](https://www.graphqlhub.com/)

## Schemas

- [Hacker News](schemas/hn.js)
- [Reddit](schemas/reddit.js)
- [GitHub](schemas/github.js)
- [Twitter](schemas/twitter.js)
- [GraphQLHub](schemas/graphqlhub.js), which contains all the other schemas

## Quick start

```bash
# clone the repo
git clone https://github.com/clayallsopp/graphqlhub.git

# change into the repo directory
cd graphqlhub

# install
npm install

# create your .env file
cp .env.example .env
# ... and populate .env with your API keys

# run
npm run start
```

Then visit [http://localhost:3000](http://localhost:3000) in your browser.

## TODO

- Better visual design
- Add more APIs!
- Extract the schemas into their own repo, so others can easily drop them into their own projects
- Use GraphiQL from NPM, not the vendoring thing done now

PRs for anything above would be excellent!
