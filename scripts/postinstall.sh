#!/bin/bash

if [ ! -z ${IS_HEROKU+x} ] && [[ $IS_HEROKU == "true" ]]; then
  exit 0
fi

npm link ./graphqlhub-schemas && cd ./node_modules/graphqlhub-schemas && npm run bundle && cd ..
exit $?
