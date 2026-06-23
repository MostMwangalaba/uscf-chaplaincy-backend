FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY backend/ /app/

ENV COMPOSER_MEMORY_LIMIT=-1
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_PROCESS_TIMEOUT=2000

# Disable advisory block globally (just in case)
RUN composer config --global policy.advisories.block false

RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --ignore-platform-reqs

RUN php artisan config:cache || true
RUN php artisan route:cache || true
RUN php artisan view:cache || true
RUN php artisan storage:link || true

EXPOSE 10000

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
