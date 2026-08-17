#!/bin/bash
set -e

# Wait for Postgres to be ready
while ! (echo > /dev/tcp/db/5432) 2>/dev/null; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Migrations are applied automatically on startup by Program.cs
dotnet Quintus.WebAPI.dll