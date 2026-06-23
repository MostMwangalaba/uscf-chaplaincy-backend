FROM php:8.2-fpm

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy only the backend folder
COPY backend/ /app/

# Set environment variables
ENV APP_ENV=production
ENV COMPOSER_MEMORY_LIMIT=-1
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_PROCESS_TIMEOUT=2000

# Install dependencies (with all safe flags)
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --ignore-platform-req=ext-*

# Cache Laravel config, routes, views
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan storage:link || true

# Expose port
EXPOSE 10000

# Start the server (migrations will run after container starts)
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
