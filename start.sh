#!/bin/bash
export $( grep -vE "^(#.*|\s*)$" .env )

CONFIG="./package.json"
IMG_NAME="ssb"
IMG_VER=`cat ${CONFIG} | grep '"version"' | awk 'BEGIN{FS="\""} {print $4}'`

docker pull ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}
if [[ $(docker ps -aq) ]]; then
  docker stop $(docker ps -aq)
  docker rm $(docker ps -aq)
fi
# docker rmi $(docker images -aq)
docker run -d -p 3000:3000 -p 3001:3001 --restart unless-stopped --name ssb ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}
docker image prune -af
