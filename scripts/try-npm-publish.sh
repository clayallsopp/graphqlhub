#!/bin/bash

[ ! -z ${TRAVIS_TAG+x} ] && cd ./graphqlhub-schemas
exit 0
