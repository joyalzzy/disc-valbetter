## build runner
FROM node:current-alpine as build-runner

# Set temp directory
WORKDIR /app

# Move package.json
COPY . /app/

# Install dependencies
RUN npm install

# Build project
RUN npm run build

## production runner
FROM node:current-alpine as prod-runner
LABEL org.opencontainers.image.source="https://github.com/joyalzzy/wagalorant"


# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /app/package.json /app/package.json

# Install dependencies
RUN npm install --omit=dev

# Move build files
COPY --from=build-runner /app/build /app/build

# Start bot
CMD [ "npm", "run", "start" ]
