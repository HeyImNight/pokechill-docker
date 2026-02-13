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
