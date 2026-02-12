# Building and Pushing Docker Image

This guide explains how to build and push the Docker image for Pokechill.

## Prerequisites

- Docker installed and running.
- Logged in to Docker Hub: `docker login` (if pulling/pushing to a private repository or needing authentication).

## Quick Start

Run the helper script:

```bash
./scripts/publish.sh
```

## Manual Steps

1.  **Build the Image**:
    ```bash
    docker build -t nightis/pokechill-docker:latest .
    ```
    This builds the image using the `Dockerfile` in the current directory and tags it as `nightis/pokechill-docker:latest`.

2.  **Push the Image**:
    ```bash
    docker push nightis/pokechill-docker:latest
    ```
    This pushes the image to Docker Hub under the `nightis` user.

## Running in Production

Use the production compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d
```
