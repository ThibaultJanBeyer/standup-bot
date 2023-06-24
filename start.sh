#!/bin/bash
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
docker run -d -p 3000:3000 --restart unless-stopped --name ssb ${HOST}/${IMG_NAME}:${IMG_VER}
