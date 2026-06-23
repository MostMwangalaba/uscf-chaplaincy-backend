FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY backend/ /app/

ENV APP_ENV=production

RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-* --no-interaction

RUN php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache

EXPOSE 10000

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=10000
