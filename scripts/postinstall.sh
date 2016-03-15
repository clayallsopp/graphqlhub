#!/bin/bash

set -x

cd ./graphqlhub-schemas && npm i && npm run bundle && cd ..
exit $?
