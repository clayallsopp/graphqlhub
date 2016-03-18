#!/bin/bash

set -ex

REGISTRY='registry.npmjs.org'

touch ~/.npmrc
echo "//$REGISTRY/:_authToken=${NPM_API_KEY}" > ~/.npmrc
cd ./graphqlhub-schemas
npm publish
rm ~/.npmrc
