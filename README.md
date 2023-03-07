# service-voucher-campaign

Backend server to manage campaigns and vouchers.

## Table of contents

- [Installation and configuration](#installation-and-configuration)
  - [Configuration to run and test service locally](#configuration-to-run-and-test-service-locally)
    - [How to run service](#how-to-run-service)
    - [How to test service](#how-to-test-service)
  - [Run and test service in docker](#run-and-test-service-in-docker)

## Installation and configuration

### Configuration to run and test service locally

1. Run this command to use correct Node version _(optional step)_:

```
nvm use
```

2. Run this command to fetch shmig file (will be used for migrations) and install deps:

```
make deps
```

#### How to run service

1. Make sure that you have PostgreSQL running locally or in docker-compose. You can use this command to create PostgreSQL container:

```
docker-compose docker-compose.yml up db --build
```

2. Run this command to create `.env` file (or create it manually):

```
cp .env.tpl .env
```

3. Update `.env` file with environment variables (server port, db connection), if needed.

4. Run this command to up migrations, create build and run service:

```
make run
```

#### How to test service

1. Make sure that you have PostgreSQL running locally or in docker-compose. You can use this command to create PostgreSQL container:

```
docker-compose docker-compose.yml up db --build
```

2. Run this command to create `.env.test` file (or create it manually):

```
cp .env.tpl .env.test
```

3. Update `.env.test` file with environment variables (server port, db connection), , if needed.

4. Run this command to up migrations and test service:

```
make test
```

### Run and test service in docker

Before the next steps, be assure that service and db ports are not used by other processes on your machine.

- To run:

```
docker-compose docker-compose.yml up --build
```

- To test:

```
docker-compose docker-compose.test.yml up --build
```

## Technology stack

The project was build using [Node v16.x] and uses the following technologies:

- Dependencies

```
  - express@4.18.2
  - pg@8.9.0
  - cors@2.8.5
  - helmet@6.0.1
  - papaparse@5.4.0
  - dotenv@16.0.3
  - trust-env@2.2.1
  - zod@3.20.6
  - module-alias@2.2.2
  - uuid@9.0.0
```

- Dev dependencies

```
  - nodemon@2.0.20
  - typescript@4.9.5
```

- Testing:

```
  - jest@29.4.3
  - ts-jest@29.0.5
  - supertest@6.3.3
```

- Improve code quality:

```
  - prettier@2.8.4
  - eslint@8.35.0
```
