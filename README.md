<p align="center">
  <img src="public/images/graphqlhub-logo.png" alt="GraphQLHub Logo" width="305" height="300"/>
</p>

[![Deploy your own GraphQLHub](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Set the API key values in the deploying page under config variables. Only Twitter and Giphy API keys are required, others are optional.

# GraphQLHub Schemas

Want to install the various GraphQLHub schemas and use on your own? See [graphqlhub-schemas](./graphqlhub-schemas) for details.

# GraphQLHub Server [![Build Status](https://travis-ci.org/clayallsopp/graphqlhub.svg)](https://travis-ci.org/clayallsopp/graphqlhub) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fclayallsopp%2Fgraphqlhub.svg?size=small)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fclayallsopp%2Fgraphqlhub?ref=badge_small)

This powers the server behind [GraphQLHub](http://www.graphqlhub.com/). It's basically:

- The GraphQL Schemas and fetching code for each API
- A slightly forked version of [GraphiQL](https://github.com/graphql/graphiql)

> Try the [live app here](https://www.graphqlhub.com/)

## Schemas

- [Hacker News](graphqlhub-schemas/src/hn.js)
- [Reddit](graphqlhub-schemas/src/reddit.js)
- [GitHub](graphqlhub-schemas/src/github.js)
- [Twitter](graphqlhub-schemas/src/twitter.js)
- [GraphQLHub](graphqlhub-schemas/src/graphqlhub.js), which contains all the other schemas

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

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fclayallsopp%2Fgraphqlhub.svg?size=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fclayallsopp%2Fgraphqlhub?ref=badge_large)

## TODO

- Better visual design
- Add more APIs!
- Extract the schemas into their own repo, so others can easily drop them into their own projects
- Use GraphiQL from NPM, not the vendoring thing done now

PRs for anything above would be excellent!
