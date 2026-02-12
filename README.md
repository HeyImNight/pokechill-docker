# DISCLAIMER
**This was done with Google's Antigravity IDE**
**Pokechill is an open-source project. I have just changed it to do what I would like**
**For official github, https://github.com/play-pokechill/play-pokechill.github.io

# What the hell this is
This is a fork of https://github.com/play-pokechill/play-pokechill.github.io. with some added features.
main differences, 
1. Added SQLite database for login in settings
2. It is now a docker. on dockerhub at, https://hub.docker.com/repository/docker/nightis/pokechill-docker/general

# How to set up
it has the docker file but for sake of convience, here is the docker.compose
```
services:
  pokechill:
    image: nightis/pokechill-docker:latest
    container_name: pokechill
    ports:
      - "3000:3000"
    volumes:
      # This maps a 'pokechill_data' docker volume to the container's data directory.
      # Your save data and database will be stored here safely.
      - pokechill_data:/data
    restart: always

volumes:
  pokechill_data:
```

