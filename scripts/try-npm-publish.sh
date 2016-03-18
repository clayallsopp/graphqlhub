#!/bin/bash

set -x

[ ! -z ${TRAVIS_TAG+x} ] && cd ./graphqlhub-schemas
exit 0
