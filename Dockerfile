FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
# COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
# We need to install dependencies in the server directory
WORKDIR /usr/src/app/server
RUN npm install

# Return to app root
WORKDIR /usr/src/app

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Environment variable for database path
ENV DB_PATH=/data/pokechill.db

# Create data directory
RUN mkdir -p /data

# Volume for persistence
VOLUME /data

# Command to run the application
CMD ["node", "server/server.js"]
