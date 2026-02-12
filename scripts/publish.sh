#!/bin/bash
set -e

# Default image name
IMAGE_NAME="nightis/pokechill-docker:latest"

echo "Building Docker image: $IMAGE_NAME..."
docker build -t $IMAGE_NAME .

echo "Pushing Docker image: $IMAGE_NAME..."
docker push $IMAGE_NAME

echo "Successfully built and pushed $IMAGE_NAME"
