# Backend - Laravel 13

API REST pour la gestion des candidatures.

## Prerequis

- PHP >= 8.2
- Composer
- MySQL

## Installation

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

## Variables d'environnement

```env
APP_NAME=JobApplicationApp
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=job-application
DB_USERNAME=root
DB_PASSWORD=
FILESYSTEM_DISK=public
```

## Documentation des endpoints API

### POST /api/applications

Description: Soumettre une candidature.

Format: multipart/form-data

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| nom | string | oui | Nom complet |
| email | string | oui | Adresse email valide |
| role | string | oui | dev ou designer |
| motivation | string | oui | Min 20 caracteres |
| portfolio | string | non | URL du portfolio |
| cv | file | non | PDF, DOC, DOCX - max 2Mo |

Reponse succes 201:

```json
{
	"id": 1,
	"nom": "John Doe",
	"email": "john@example.com",
	"role": "dev",
	"motivation": "...",
	"portfolio": "https://...",
	"cv": "cvs/fichier.pdf",
	"score": 4,
	"created_at": "2024-01-01T00:00:00Z"
}
```

Reponse erreur 422:

```json
{
	"message": "The given data was invalid.",
	"errors": {
		"email": ["The email field is required."],
		"nom": ["The nom field is required."]
	}
}
```

### GET /api/applications

Description: Recuperer toutes les candidatures.

Query params optionnels:

| Parametre | Valeurs | Description |
|---|---|---|
| role | dev, designer | Filtrer par role |
| sort | score, date | Trier les resultats |

Reponse succes 200:

```json
{
	"data": [...],
	"total": 10
}
```

## Structure des fichiers

```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── ApplicationController.php
│   │   └── Requests/
│   │       └── StoreApplicationRequest.php
│   ├── Models/
│   │   └── Application.php
│   └── Services/
│       └── ScoringService.php
├── database/
│   └── migrations/
│       └── xxxx_create_applications_table.php
├── routes/
│   └── api.php
└── storage/
    └── app/public/cvs/   # fichiers CV uploades
```

## Commandes utiles

```bash
php artisan migrate:fresh   # reinitialiser la base de donnees
php artisan migrate:status  # voir l'etat des migrations
php artisan route:list      # lister toutes les routes
php artisan storage:link    # creer le lien symbolique public/storage
```
