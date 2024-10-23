COMPOSE = docker compose
COMPOSE_RUN = $(COMPOSE) run --rm --no-deps
BACKEND_RUN = $(COMPOSE_RUN) backend
FRONTEND_RUN = $(COMPOSE_RUN) frontend

PIP = $(BACKEND_RUN) pip
PIP_INSTALL = $(PIP) install -U --user
UV = $(BACKEND_RUN) uv
PNPM = $(FRONTEND_RUN) pnpm

.PHONY: env
env:
	$(PIP_INSTALL) pip
	$(PIP_INSTALL) uv
	$(UV) sync
	$(FRONTEND_RUN) npm config set prefix '~/.local/'
	$(FRONTEND_RUN) corepack enable pnpm
	$(PNPM) update

.PHONY: up
up: env
	$(COMPOSE) up

.PHONY: format
format:
	$(UV) tool run isort .
	$(UV) tool run ruff format
	$(PNPM) dlx prettier --write .

.PHONY: check
check:
	$(UV) tool run ruff check
	$(PNPM) lint

.PHONY: shell-backend shell-frontend
shell-backend shell-frontend: shell-%:
	$(COMPOSE_RUN) $* bash

.PHONY: update
update:
	$(UV) update
	$(PNPM) update
