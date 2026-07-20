#!/usr/bin/env bash
# Starts the user-local Postgres 16 cluster PagePilot uses in development.
# Safe to run repeatedly; does nothing when the server is already up.
set -euo pipefail

PGBIN=/usr/lib/postgresql/16/bin
PGDATA="$HOME/.pagepilot-pgdata"
PORT=5433

if "$PGBIN/pg_isready" -h 127.0.0.1 -p "$PORT" -q 2>/dev/null; then
  echo "Postgres already running on port $PORT"
  exit 0
fi

"$PGBIN/pg_ctl" -D "$PGDATA" -o "-p $PORT -k /tmp -c listen_addresses=127.0.0.1" -l "$PGDATA/log" start
"$PGBIN/pg_isready" -h 127.0.0.1 -p "$PORT" && echo "Postgres up on port $PORT"
