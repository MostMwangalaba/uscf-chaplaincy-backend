FROM php:8.2-fpm

# Install dependencies and PostgreSQL client
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql mbstring exif pcntl bcmath gd

# Create ini files to enable extensions
RUN echo "extension=pdo_pgsql.so" > /usr/local/etc/php/conf.d/pdo_pgsql.ini \
    && echo "extension=pgsql.so" > /usr/local/etc/php/conf.d/pgsql.ini

# Verify extensions are enabled (will fail build if not)
RUN php -m | grep -E 'pdo_pgsql|pgsql' || (echo "Extensions not found" && exit 1)

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy backend folder
COPY backend/ /app/

# Environment variables
ENV APP_ENV=production
ENV COMPOSER_MEMORY_LIMIT=-1
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_PROCESS_TIMEOUT=2000

# Disable security advisories
RUN composer config --global policy.advisories.block false

# Install dependencies (ignore platform requirements)
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --ignore-platform-reqs

# Cache Laravel config, routes, views
RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true
RUN php artisan storage:link || true

# Expose port
EXPOSE 10000

# Start server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
