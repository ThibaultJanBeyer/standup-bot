#!/bin/bash
export $( grep -vE "^(#.*|\s*)$" .env )

echo '====== Docker image builder ======'
echo
echo '*** STEP 1. Login ***'
echo

# docker login -u <username> -p <password>

echo '====== Docker image builder ======'
echo
echo '*** STEP 2. Building ***'
echo

CONFIG="./package.json"
IMG_NAME="ssb"
IMG_VER=`cat ${CONFIG} | grep '"version"' | awk 'BEGIN{FS="\""} {print $4}'`

echo "[START] Building Package: ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}"

docker build . -f ./dockerfile --platform linux/amd64 -t ${DOCKERHUB_USERNAME}/${IMG_NAME}:latest -t ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}

echo "[END] Building Package: ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}"

echo '====== Docker image builder ======'
echo
echo '*** STEP 3. Pushing ***'
echo

echo "[START] Pushing Package: ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}"

docker push ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}

echo "[END] Pushing Package: ${DOCKERHUB_USERNAME}/${IMG_NAME}:${IMG_VER}"
