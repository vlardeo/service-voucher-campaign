# Make TS build
FROM node:16.14-alpine as build

WORKDIR /usr/src/app

# Bash is required to run shmig
RUN apk update && apk add --no-cache postgresql13=13.10-r0 bash=5.1.16-r0 make curl

COPY . .

RUN make deps
RUN make build

# Use TS build
FROM node:16.14-alpine as prod

WORKDIR /usr/src/app

# Bash is required to run shmig
RUN apk update && apk add --no-cache postgresql13=13.10-r0 bash=5.1.16-r0 make curl

COPY Makefile Makefile
COPY package.json package.json
COPY migrations migrations
COPY --from=build /usr/src/app/dist ./dist

RUN make _dbmigrate
RUN npm install --only=production

CMD ["make", "run-docker"]
