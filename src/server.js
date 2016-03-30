import express from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQLSchema, printSchema } from 'graphql';
import cors from 'cors';
import fs from 'fs';

import Handlebars from 'handlebars';

import { GraphQLHub } from '../graphqlhub-schemas';
import instrumentationMiddleware from './graphQLInstrumentation';

let Schema = new GraphQLSchema({
  query    : GraphQLHub.QueryObjectType,
  mutation : GraphQLHub.MutationsType,
});


import path from 'path';

import timingCallback from './timingCallback';

let IS_PROD = (process.env.NODE_ENV === 'production');
let CDN = {
  reactDom     : 'https://cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react-dom.min.js',
  react        : 'https://cdnjs.cloudflare.com/ajax/libs/react/0.14.7/react.min.js',
  fetch        : 'https://cdnjs.cloudflare.com/ajax/libs/fetch/0.9.0/fetch.min.js',
  keen         : 'https://cdnjs.cloudflare.com/ajax/libs/keen-js/3.3.0/keen.min.js',
  graphiqlCss  : 'https://cdnjs.cloudflare.com/ajax/libs/graphiql/0.6.3/graphiql.min.css',
  graphiqlJs   : 'https://cdnjs.cloudflare.com/ajax/libs/graphiql/0.6.3/graphiql.min.js',
  normalizeCss : 'https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.3/normalize.min.css',
};

let CONSTANTS = {
  reactPath       : (IS_PROD ? CDN.react        : '/react.js'),
  reactDomPath    : (IS_PROD ? CDN.reactDom     : '/reactDom.js'),
  fetchPath       : (IS_PROD ? CDN.fetch        : '/fetch.js'),
  keenPath        : (IS_PROD ? CDN.keen         : '/keen.js'),
  graphiqlCssPath : (IS_PROD ? CDN.graphiqlCss  : '/graphiql.css'),
  graphiqlJsPath  : (IS_PROD ? CDN.graphiqlJs   : '/graphiql.js'),
  normalizePath   : (IS_PROD ? CDN.normalizeCss : '/normalize.css'),

  keenProjectId : process.env.KEEN_PROJECT_ID,
  keenReadKey   : process.env.KEEN_READ_KEY,
};

let compileFile = function(filePath) {
  let fileString = fs.readFileSync(filePath, "utf8");
  return Handlebars.compile(fileString)({ CONSTANTS });
};

let HTMLS = {
  PLAYGROUND : () => compileFile(path.join(__dirname, '..', 'public', 'playground', 'index.html')),
  INDEX      : () => compileFile(path.join(__dirname, '..', 'public', 'index.html')),
};

let CACHED_HTMLS = Object.keys(HTMLS).reduce((value, key) => {
  value[key] = HTMLS[key]();
  return value;
}, {});
let renderHTML = (key) => {
  return (req, res) => {
    if (IS_PROD) {
      res.send(CACHED_HTMLS[key]);
    }
    else {
      res.send(HTMLS[key]());
    }
  };
};

let app = express();
app.get('/playground', renderHTML('PLAYGROUND'));
app.get('/', renderHTML('INDEX'));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/graphql', cors(), instrumentationMiddleware(Schema, timingCallback, { addToResponse : false }), graphqlHTTP((req, res) => {
  return { schema: Schema, rootValue : req.rootValue }
}));

let SHORTCUTS = {
  reddit   : '/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%09reddit%20%7B%0A%20%20%20%20user(username%3A%20"kn0thing")%20%7B%0A%20%20%20%20%20%20username%0A%20%20%20%20%20%20commentKarma%0A%20%20%20%20%20%20createdISO%0A%20%20%20%20%7D%0A%20%20%20%20subreddit(name%3A%20"movies")%7B%0A%20%20%20%20%20%20newListings(limit%3A%202)%20%7B%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%20%20comments%20%7B%0A%20%20%20%20%20%20%20%20%20%20body%0A%20%20%20%20%20%20%20%20%20%20author%20%7B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20username%0A%20%20%20%20%20%20%20%20%20%20%09commentKarma%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D'
  ,
  hn       : '/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%20hn%20%7B%0A%20%20%20%20topStories(limit%3A%201)%20%7B%0A%20%20%20%20%20%20title%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20timeISO%0A%20%20%20%20%20%20by%20%7B%0A%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20kids(limit%3A%201)%20%7B%0A%20%20%20%20%20%20%20%20timeISO%0A%20%20%20%20%20%20%20%20by%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D'
  ,
  keyvalue : '/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%0A%23mutation%20GraphQLHubMutationAPI%20%7B%0A%23%20keyValue_setValue(input%3A%20%7B%0A%23%20%20%20clientMutationId%3A%20"browser"%2C%20id%3A%20"someKey"%2C%20value%3A%20"some%20value"%20%0A%23%20%20%7D)%20%7B%0A%23%20%20%20item%20%7B%0A%23%20%20%20%20value%0A%23%20%20%20%20id%0A%23%20%20%20%7D%0A%23%20%20%20clientMutationId%0A%23%20%7D%0A%23%7D%0A%0Aquery%20GraphQLHubAPI%20%7B%0A%20%20keyValue%20%7B%0A%20%20%20%20getValue(id%3A%20"initialKey")%20%7B%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20value%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A'
  ,
  github   : '/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%20github%20%7B%0A%20%20%20%20user(username%3A%20"clayallsopp")%20%7B%0A%20%20%20%20%20%20login%0A%20%20%20%20%20%20avatar_url%0A%20%20%20%20%7D%0A%20%20%20%20repo(ownerUsername%3A%20"clayallsopp"%2C%20name%3A%20"graphqlhub")%20%7B%0A%20%20%20%20%20%20commits%20%7B%0A%20%20%20%20%20%20%20%20sha%0A%20%20%20%20%20%20%20%20message%0A%20%20%20%20%20%20%20%20author%20%7B%0A%20%20%20%20%20%20%20%20%20%20...%20on%20GithubUser%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20login%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20...%20on%20GithubCommitAuthor%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20email%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D'
  ,
  twitter  : '/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%20twitter%20%7B%0A%20%20%20%20user%20(identifier%3A%20name%2C%20identity%3A%20"clayallsopp")%20%7B%0A%20%20%20%20%20%20created_at%0A%20%20%20%20%20%20description%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20screen_name%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20profile_image_url%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20tweets_count%0A%20%20%20%20%20%20followers_count%0A%20%20%20%20%20%20tweets(limit%3A%201)%20%7B%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20tweet(id%3A%20"687433440774459392")%20%7B%0A%20%20%20%20%20%20text%2C%0A%20%20%20%20%20%20retweets(limit%3A%202)%20%7B%0A%20%20%20%20%20%20%20%20id%2C%0A%20%20%20%20%20%20%20%20retweeted_status%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20user%20%7B%0A%20%20%20%20%20%20%20%20%20%20screen_name%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20search(q%3A%20"Javascript"%2C%20count%3A%201%2C%20result_type%3A%20mixed)%20%7B%0A%20%20%20%20%20%20user%20%7B%0A%20%20%20%20%20%20%20%20screen_name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20text%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D'
  ,
  giphy    : '/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20"Docs"%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%20giphy%20%7B%0A%09%09random(tag%3A"javascript")%20%7B%0A%20%20%20%20%09id%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20images%20%7B%0A%20%20%20%20%20%20%20%20original%20%7B%0A%20%20%20%20%20%20%20%20%20%20url%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%09%7D%0A%20%20%7D%0A%7D'
  ,
};
Object.keys(SHORTCUTS).forEach((shortcut) => {
  app.get(`/playground/${shortcut}`, (req, res) => {
    res.redirect(SHORTCUTS[shortcut]);
  });
  app.get(`/schema/${shortcut}`, (req, res) => {
    let field = GraphQLHub.QueryObjectType.getFields()[shortcut];
    res.set('Content-Type', 'text/plain');
    res.send(printSchema(new GraphQLSchema({ query: field.type })));
  });
});

app.use(function(err, req, res, next) {
  console.error(err.toString());
  console.error(err.stack);
  next(err);
});

let PORT = process.env.PORT || 3000;
export const server = app.listen(PORT, () => {
  let host = server.address().address;
  let port = server.address().port;

  console.log(`Listening at http://${host}:${port}`);
});
