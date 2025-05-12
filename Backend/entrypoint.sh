#!/bin/sh

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."

while ! nc -z db 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

exec "$@"