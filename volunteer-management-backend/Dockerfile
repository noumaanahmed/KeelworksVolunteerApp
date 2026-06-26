# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY src ./
# Expose the application port (default for Express is 3000)
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
