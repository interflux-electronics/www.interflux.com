#!/usr/local/bin/fish

set branch (git rev-parse --abbrev-ref HEAD)
set revision (git rev-parse --short HEAD)
set remote "jw@server.interflux.com"
set path "/var/www/www.interflux.com"

echo ----------
echo Deploying:
echo Branch: $branch
echo Revision: $revision
echo Remote: $remote
echo ----------

switch $branch
case production
  echo scp install.sh $remote:$path
  scp install.sh $remote:$path
  and echo ----------
  and echo ssh $remote "$path/install.sh $branch $revision"
  and ssh $remote "$path/install.sh $branch $revision"
case '*'
    echo Aborting - Only the branch production is deployable.
    echo ----------
end
