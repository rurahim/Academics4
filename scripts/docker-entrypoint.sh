#!/bin/sh
set -e

echo "Starting Academics4..."

# Wait for database to be ready
echo "Waiting for database..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "Database is up!"

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting Next.js server..."
exec node server.js
