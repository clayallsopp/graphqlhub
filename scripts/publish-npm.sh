#!/bin/bash

set -e

REGISTRY='registry.npmjs.org'

touch ~/.npmrc
echo "//$REGISTRY/:_authToken=${NPM_API_KEY}" > ~/.npmrc
cd ./graphqlhub-schemas
npm publish
rm ~/.npmrc
