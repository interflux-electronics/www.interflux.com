#!/usr/bin/env bash

set -e
set -o pipefail

branch=$(git rev-parse --abbrev-ref HEAD)
revision=$(git rev-parse --short HEAD)

echo "----------"
echo "Deploying:"
echo $branch
echo $revision
echo "----------"
echo "scp install.sh jw@server.interflux.com:/var/www/interflux.com"
scp install.sh jw@server.interflux.com:/var/www/interflux.com
echo "----------"
echo 'ssh jw@server.interflux.com "/var/www/interflux.com/install.sh $branch $revision"'
ssh jw@server.interflux.com "/var/www/interflux.com/install.sh $branch $revision"
