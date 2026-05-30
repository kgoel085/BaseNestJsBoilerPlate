FROM node:20.12.0-alpine AS builder

# build argument and environment (ensure devDependencies are installed during build)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# Install build tools required for some native modules
RUN apk add --no-cache python3 make g++ bash git

# Prevent `prepare` scripts (husky) from failing during image builds
ENV CI=true

# Install dependencies (full set) and build the app
COPY package*.json ./
# Avoid running lifecycle scripts (e.g. husky/prepare) before packages are installed
RUN npm install --legacy-peer-deps --no-audit --progress=false --ignore-scripts

# Ensure runtime packages required by the code (but missing from package.json) are present
# Install `bull` and its TS types into node_modules without changing package.json
RUN npm install bull @types/bull --no-save --legacy-peer-deps --no-audit --progress=false || true

COPY . .
# If a prebuilt `dist` directory is present in the build context, use it.
# This lets you build locally (avoiding in-container TS issues) and keep
# source readable in the final image. If `dist` is absent, the container
# will attempt to run the build inside the builder stage.
RUN if [ -d ./dist ]; then echo "Using prebuilt dist from context"; else npm run build; fi

# Remove devDependencies from node_modules to shrink footprint
RUN npm prune --production

FROM node:20.12.0-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--inspect=0.0.0.0:9229 --heapsnapshot-signal=SIGUSR2"

# Copy runtime artifacts and keep source files readable in the image
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
# COPY --from=builder /usr/src/app/src ./src
# COPY --from=builder /usr/src/app/env-example ./env-example
# COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json

# Copy startup scripts and fix permissions/line endings
COPY --from=builder /usr/src/app/wait-for-it.sh /opt/wait-for-it.sh
COPY --from=builder /usr/src/app/startup.relational.sh /opt/startup.relational.sh
RUN chmod +x /opt/wait-for-it.sh /opt/startup.relational.sh \
	&& sed -i 's/\r//g' /opt/wait-for-it.sh /opt/startup.relational.sh



# run as non-root
USER node

CMD ["sh", "/opt/startup.relational.sh"]

