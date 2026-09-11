#!/usr/bin/env bash
set -euo pipefail
root=$(git rev-parse --show-toplevel)
baseline=efcc0490f93ed98d7d05b839ccd83fe96c757c4e
scratch=$(mktemp -d)
container_id=''
cleanup() {
  if [[ -n "$container_id" ]]; then docker rm -f "$container_id" >/dev/null; fi
  rm -rf "$scratch"
}
trap cleanup EXIT
mkdir -p "$scratch/old" "$scratch/new"
git archive "$baseline" backend | tar -x -C "$scratch/old"
git archive HEAD backend | tar -x -C "$scratch/new"
for version in old new; do
  mkdir -p "$scratch/$version/backend/cmd/compatcheck"
  cp "$root/deploy/compatcheck/main.go" "$scratch/$version/backend/cmd/compatcheck/main.go"
  (cd "$scratch/$version/backend" && go build -o "$scratch/$version-check" ./cmd/compatcheck)
done
container_id=$(docker run -d --rm -e POSTGRES_PASSWORD=compat-local-only -p 127.0.0.1::5432 postgres:18-alpine)
for attempt in $(seq 1 60); do
  if docker exec "$container_id" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done
port=$(docker port "$container_id" 5432/tcp | sed 's/.*://')
export COMPAT_DATABASE_URL="postgres://postgres:compat-local-only@127.0.0.1:$port/postgres?sslmode=disable"
"$scratch/old-check" baseline
"$scratch/new-check" upgrade
"$scratch/old-check" rollback
"$scratch/new-check" reupgrade
