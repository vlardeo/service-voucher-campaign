# To run in docker
FROM node:16.14-alpine as runtime

WORKDIR /usr/src/app

# Bash is required to run shmig
RUN apk update && \
  apk add --no-cache postgresql13=13.10-r0 bash=5.1.16-r0 make curl && \
  wget --quiet https://raw.githubusercontent.com/mbucc/shmig/master/shmig && \
  chmod +x shmig

COPY Makefile Makefile
COPY migrations migrations
COPY *.json /
COPY src src

RUN npm install

CMD ["make", "run-docker"]
