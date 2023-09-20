#!/bin/bash
export $( grep -vE "^(#.*|\s*)$" .env )

CONFIG="./package.json"
IMG_NAME="ssb"
IMG_VER=`cat ${CONFIG} | grep '"version"' | awk 'BEGIN{FS="\""} {print $4}'`

if [[ $(docker ps -aqf name=${IMG_NAME}) ]]; then
  docker stop ${IMG_NAME}
  docker rm ${IMG_NAME}
  docker rmi ${IMG_NAME}
  docker image prune -af
fi
docker pull ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}
docker run -d -p 127.0.0.1:3000:3000 -p 127.0.0.1:3001:3001 --restart unless-stopped --name ${IMG_NAME} ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}
docker image prune -af
