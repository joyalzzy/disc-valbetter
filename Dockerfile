FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY package.json /app/package.json

# Install dependencies
RUN npm install --omit=dev

# Move build files
COPY build /app/build

# Start bot
CMD [ "npm", "run", "start" ]