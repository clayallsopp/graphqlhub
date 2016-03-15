#!/bin/bash

set -x

if [ ! -z ${IS_HEROKU+x} ] && [[ $IS_HEROKU == "true" ]]; then
  exit 0
fi

cd ./graphqlhub-schemas && npm i && npm run bundle && cd ..
exit $?
