#!/bin/bash
set -e

export PATH="$PATH:/root/.dotnet/tools"

# Wait for Postgres to be ready
while ! (echo > /dev/tcp/db/5432) 2>/dev/null; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Run EF Core migrations
dotnet ef database update --project /app/Quintus/Quintus.Repository/Quintus.Repository.csproj --startup-project /app/Quintus/Quintus.WebAPI/Quintus.WebAPI.csproj

# Start the app
dotnet Quintus.WebAPI.dll