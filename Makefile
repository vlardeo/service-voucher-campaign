SHELL := $(shell which bash)
.SHELLFLAGS = -c

.SILENT: ;               # No need for @
.ONESHELL: ;             # Recipes execute in same shell
.NOTPARALLEL: ;          # Wait for this target to finish
.EXPORT_ALL_VARIABLES: ; # Send all vars to shell

default: help

help: ## Display help for make commands
	grep -E '^[0-9a-zA-Z_-]+:.*?# .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.PHONY: help

# Run commands

all: ## run all developer tasks
	$(MAKE) deps
	$(MAKE) lint
	$(MAKE) test-cover
.PHONY: all

deps: _dbmigrate ## Install dependencies
	npm install
.PHONY: deps

_dbmigrate:
	if [ ! -f .shmig ]; then \
		curl -o shmig https://raw.githubusercontent.com/mbucc/shmig/master/shmig ; \
	fi ;\
	chmod +x shmig;
.PHONY: _dbmigrate

init: ## Initialize database
	if [ -f .env ]; then \
		export $$(cat .env | grep -v ^\# | xargs) >> /dev/null ; \
	else \
		echo ".env file not read" ; \
	fi ; \
	./shmig -t postgresql -l $$POSTGRESQL_USER -p $$POSTGRESQL_PASSWORD -d $$POSTGRESQL_DATABASE -H $${POSTGRESQL_HOST:-localhost} -P $${POSTGRESQL_PORT:-5432} -s migrations up \
		&& echo "migrations: ok"
.PHONY: init

build: ## Run TS build
	# Also copy non .ts files into dist/ keeping their path
	# https://github.com/Microsoft/TypeScript/issues/30835#issuecomment-553733016
	npm run build
.PHONY: build

build-watch: ## Run TS build and watch modified files
	npm run build:watch
.PHONY: build-watch

run: init ## Run application
	# Do not use Yarn/NPM to start the app
	# https://lagoon.readthedocs.io/en/latest/using_lagoon/nodejs/graceful_shutdown/
	npm run build
	node dist
.PHONY: run

run-docker: init-docker ## Run application in docker
	# Do not use Yarn/NPM to start the app
	# https://lagoon.readthedocs.io/en/latest/using_lagoon/nodejs/graceful_shutdown/
	node dist
.PHONY: run-docker

init-docker: ## Initialize database
	./shmig -t postgresql -l $$POSTGRESQL_USER -p $$POSTGRESQL_PASSWORD -d $$POSTGRESQL_DATABASE -H $$POSTGRESQL_HOST -P $${POSTGRESQL_PORT:-5432} -s migrations up \
		&& echo "migrations: ok"
.PHONY: init-docker

run-watch: init ## Run TS build, watch modified files and run application
	npm run serve:watch
.PHONY: run-watch

# Units tests commands

test-init: ## Initialize units tests database
	if [ -f .env.test ]; then \
		export $$(cat .env.test | grep -v ^\# | xargs) >> /dev/null ; \
	else \
		echo ".env.test file not read" ; \
	fi ; \
	./shmig -t postgresql -l $$POSTGRESQL_USER -p $$POSTGRESQL_PASSWORD -d $$POSTGRESQL_DATABASE -H $${POSTGRESQL_HOST:-localhost} -P $${POSTGRESQL_PORT:-5432} -s migrations up \
		&& echo "migrations: ok"
.PHONY: test-init

test: test-init ## Run unit tests
	npm run test
.PHONY: test

test-watch: test-init ## Run unit tests and watch modified files
	npm run test:watch
.PHONY: test-watch

test-cover: test-init ## Run unit tests with code coverage
	npm run test:cover
.PHONY: test-cover

# Misc.

lint: ## Check syntax errors
	npm run lint
.PHONY: lint

format: ## Enforce syntax format
	npm run format
.PHONY: format
