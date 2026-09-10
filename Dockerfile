FROM php:8.3-cli

RUN apt-get update \
  && apt-get install -y --no-install-recommends libonig-dev zlib1g-dev git unzip \
  && docker-php-ext-install pdo_mysql mbstring \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/ /app/backend/
WORKDIR /app/backend

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

EXPOSE $PORT

CMD php artisan serve --host=0.0.0.0 --port=$PORT