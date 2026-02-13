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
      # This maps a local 'pokechill_data' directory to the container's data directory.
      # Your database (pokechill.db) will be stored here and visible on the host.
      - ./pokechill_data:/data
      # This maps a local 'saves' directory to the container's saves directory for easy access
      - ./saves:/usr/src/app/saves
    restart: always
```
# Changelog

## Version 0.5 

### New Features
- **Cloud Save System**:
    - Implemented secure, server-side SQLite database for storing save data.
    - Added automatic save backups (keeps last 3 states).
    - Implemented auto-load on login to sync progress across devices.
    - Added "Export Data" support to download authoritative save files directly from the cloud.
- **Authentication**:
    - Added robust Login and Registration system.
    - Implemented "Confirm Password" and "Show Password" toggle.
    - Added auto-login upon successful registration.
    - Enforced "Server-Only" play by hiding Guest Mode and wiping local data on logout.
- **Cheats & Modifiers**:
    - Added "Faster Auto" cheat:
        - Player attacks 10x faster.
        - Enemies attack 10x faster.
        - Enemy respawn/swap animation is instant (0.1s).
- **Infrastructure**:
    - Dockerized the application for easy deployment.
    - Configured persistent volumes for database and save files (`/saves/[username]`).
    - Exposed `pokechill.db` locally via bind mount for easy access.

### Improvements
- **UI/UX**:
    - Added a blocking "Authentication Screen" to prevent interaction before login.
    - Improved Auth UI feedback (Status text, error alerts).
    - Removed "Import Data" and "Data to Text" buttons to prevent save scumming/conflicts.
- **Stability**:
    - Fixed infinite reload loops for new/empty accounts.
    - Fixed "Stuck Login Modal" issues.
    - Added cache busting (`?v=3`) to ensure script updates reach clients immediately.
    - Implemented aggressive local data wiping (`wipeNewUser`) to prevent data leakage between accounts.
