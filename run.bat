set COMPOSE=docker compose
set COMPOSE_RUN=%COMPOSE% run --rm --no-deps

%COMPOSE_RUN% backend uv sync
%COMPOSE_RUN% frontend pnpm update

%COMPOSE% up

