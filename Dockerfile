FROM php:8.2-fpm

# Install system dependencies
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

# Set environment variables for build
ENV APP_ENV=production
ENV DB_CONNECTION=pgsql

# Set working directory to the project root
WORKDIR /app

# Copy everything
COPY . .

# Move into backend
WORKDIR /app/backend

# Disable security advisories and install dependencies
RUN composer config --global policy.advisories.block false && \
    composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-*

# Cache configuration, routes, and views
RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan storage:link

# Run migrations (ignore errors, will be run later)
RUN php artisan migrate --force || true

# Expose port 10000
EXPOSE 10000

# Start Laravel server
CMD php artisan serve --host=0.0.0.0 --port=10000
