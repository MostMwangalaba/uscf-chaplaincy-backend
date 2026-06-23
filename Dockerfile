FROM php:8.2-fpm

# Install system dependencies and PostgreSQL client
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev \
    && docker-php-ext-configure pgsql --with-pgsql=/usr/include/postgresql \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Enable extensions
RUN echo "extension=pdo_pgsql.so" > /usr/local/etc/php/conf.d/pdo_pgsql.ini \
    && echo "extension=pgsql.so" > /usr/local/etc/php/conf.d/pgsql.ini

# Verify installation
RUN php -m | grep pdo_pgsql && echo "Extension installed successfully" || (echo "Failed" && exit 1)
RUN php -r "print_r(PDO::getAvailableDrivers());"

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY backend/ /app/

ENV APP_ENV=production
ENV COMPOSER_MEMORY_LIMIT=-1
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer config --global policy.advisories.block false
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --ignore-platform-reqs

RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true
RUN php artisan storage:link || true

EXPOSE 10000
CMD php artisan serve --host=0.0.0.0 --port=10000
