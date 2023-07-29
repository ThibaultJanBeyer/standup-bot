#!/bin/bash
CONFIG="./package.json"
HOST="standupbotcom"
IMG_NAME="ssb"
IMG_VER=`cat ${CONFIG} | grep '"version"' | awk 'BEGIN{FS="\""} {print $4}'`

docker pull ${HOST}/${IMG_NAME}:${IMG_VER}
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
# docker rmi $(docker images -aq)
docker run -d -p 3000:3000 -p 3001:3001 --restart unless-stopped --name ssb ${HOST}/${IMG_NAME}:${IMG_VER}
docker image prune -af
