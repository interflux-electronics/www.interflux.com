#!/bin/sh

set -e
set -o pipefail

branch=$(git rev-parse --abbrev-ref HEAD)
revision=$(git rev-parse --short HEAD)

echo "----------"
echo "Deploying:"
echo $branch
echo $revision
echo "----------"
echo "scp install.sh deploy@server.interflux.com:/var/www/interflux.com"
scp install.sh deploy@server.interflux.com:/var/www/interflux.com
echo "----------"
echo 'ssh deploy@server.interflux.com "/var/www/interflux.com/install.sh $branch $revision"'
ssh deploy@server.interflux.com "/var/www/interflux.com/install.sh $branch $revision"
