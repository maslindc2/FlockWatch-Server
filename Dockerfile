ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app
USER node

# Get all our dependencies and build the server
FROM base as deps
COPY package*.json ./
RUN npm ci --include=dev --prefer-offline --no-audit --progress=false
COPY tsconfig.json ./
COPY src ./src
RUN npm run build



# Using the dist folder and without the devDependencies run the production server
FROM base as prod
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit --progress=false
COPY --from=deps /usr/src/app/dist ./dist
CMD ["node", "./dist/server.js"]