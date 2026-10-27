COMPOSE = docker compose
COMPOSE_RUN = $(COMPOSE) run --rm --no-deps
BACKEND_RUN = $(COMPOSE_RUN) backend
FRONTEND_RUN = $(COMPOSE_RUN) frontend

UV = $(BACKEND_RUN) uv
PNPM = $(FRONTEND_RUN) pnpm

.PHONY: env
env:
	$(UV) sync
	$(PNPM) install

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
	$(PNPM) outdated
	$(PNPM) audit

.PHONY: shell-backend shell-frontend
shell-backend shell-frontend: shell-%:
	$(COMPOSE_RUN) $* bash

.PHONY: update
update:
	$(UV) sync --upgrade
	$(PNPM) update
