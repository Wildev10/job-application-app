FROM php:8.2-fpm

# Extensions PHP nécessaires pour Laravel
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-dev

RUN cp .env.example .env && php artisan key:generate

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

---

### 2. Vérifier que `composer.json` est bien à la racine

Railway utilise Railpack pour détecter le type de projet. Si ton `composer.json` n'est **pas à la racine** du repo, il ne reconnaît pas Laravel. Assure-toi que la structure est :
```
mon-projet/
├── composer.json   ✅ à la racine
├── artisan
├── app/
├── routes/
...
