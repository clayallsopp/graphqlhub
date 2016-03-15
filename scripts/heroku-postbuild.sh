#!/bin/bash

set -x

if [ -z ${IS_HEROKU+x} ] || [[ $IS_HEROKU != "true" ]]; then
  exit 1
fi

cd ./graphqlhub-schemas && npm i && npm run bundle && cd .. && npm i file:./graphqlhub-schemas
exit $?
