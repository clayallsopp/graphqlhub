#!/bin/sh

rm -rf dist/ && mkdir -p dist/ &&
cp node_modules/graphiql/graphiql.js dist/graphiql.js &&
cp node_modules/graphiql/graphiql.css dist/graphiql.css
