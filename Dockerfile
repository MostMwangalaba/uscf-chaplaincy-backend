FROM php:8.2-fpm

# Install system dependencies (minimal)
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
COPY backend/ backend/

# Move into backend
WORKDIR /app/backend

# Install dependencies (ignore platform requirements and security advisories)
RUN composer config --global policy.advisories.block false && \
    composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-*

# Cache config and routes (skip storage link if it fails)
RUN php artisan config:cache || true && \
    php artisan route:cache || true && \
    php artisan view:cache || true

# Expose port
EXPOSE 10000

# Start the server (migrations will run at startup)
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
