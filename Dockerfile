# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY src ./src

# Expose the port Express runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]