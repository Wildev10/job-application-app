# Job Application App

Mini application full stack de gestion de candidatures réalisée dans le cadre d’un test technique Full Stack.
Elle permet de soumettre des candidatures et de les consulter côté administration avec un scoring automatique.

![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3+-06B6D4?logo=tailwindcss&logoColor=white)

## Présentation du projet

Ce projet correspond au dépôt **job-application-app**, développé pour un test technique Full Stack.

L’objectif est de proposer une application simple, robuste et lisible pour gérer des candidatures:
- Soumettre une candidature via un formulaire web
- Stocker et valider les données côté backend
- Calculer automatiquement un score de qualité de candidature
- Consulter la liste des candidatures côté admin

## Fonctionnalités

- Formulaire de candidature avec les champs: nom, email, rôle, motivation, portfolio, CV
- Validation côté client (frontend) et côté serveur (Laravel Form Request)
- Upload de CV (formats autorisés: `pdf`, `doc`, `docx`)
- Système de scoring automatique sur 5 points
- Page admin avec liste des candidatures et score associé
- Filtres par rôle (`dev`, `designer`)
- Tri des candidatures par score ou date
- Feedback utilisateur avec SweetAlert2 (succès, erreur, validation)
- Interface responsive (mobile + desktop)

## Système de scoring

Le score est calculé automatiquement au moment de la soumission.

| Critère | Points |
|---|---:|
| Email valide | +1 |
| Portfolio renseigné | +1 |
| CV fourni | +1 |
| Rôle renseigné | +1 |
| Motivation contient des mots-clés | +1 |

Score maximum: **5/5**

Exemples de mots-clés détectés dans la motivation: `passion`, `motivation`, `experience`, `creatif`, `innovation`, `equipe`, `challenge`, `apprendre`.

## Prérequis

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL
- npm ou yarn

## Installation et lancement

### Backend (Laravel)

1. Cloner le dépôt
2. Se placer dans le dossier backend
3. Installer les dépendances avec Composer
4. Copier `.env.example` en `.env`
5. Configurer les variables d’environnement (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`)
6. Générer la clé applicative
7. Lancer les migrations
8. Créer le lien symbolique de storage
9. Lancer le serveur

```bash
git clone https://github.com/Wildev10/job-application-app.git
cd job-application-app/backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

### Frontend (Next.js)

1. Se placer dans le dossier frontend
2. Installer les dépendances
3. Créer le fichier `.env.local`
4. Lancer le serveur de développement

```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

## Variables d’environnement

### Backend — `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=job-application
DB_USERNAME=root
DB_PASSWORD=
APP_URL=http://localhost:8000
FILESYSTEM_DISK=public
```

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Endpoints API

### POST /api/applications

Crée une nouvelle candidature, applique les validations serveur, stocke le CV (si fourni) et calcule le score.

**Champs acceptés**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `nom` | `string` | Oui | Nom du candidat |
| `email` | `string` (email) | Oui | Email valide |
| `role` | `string` | Oui | Valeurs autorisées: `dev`, `designer` |
| `motivation` | `string` | Oui | Texte de motivation (min 20 caractères) |
| `portfolio` | `string` (URL) | Non | Lien portfolio |
| `cv` | `file` (`pdf`/`doc`/`docx`) | Non | CV (max 2 MB) |

**Réponse succès (201)**

```json
{
  "id": 1,
  "nom": "Alice Martin",
  "email": "alice@example.com",
  "role": "dev",
  "motivation": "Je suis passionnée par le développement web...",
  "portfolio": "https://portfolio.example.com",
  "cv": "cvs/xxxxxx.pdf",
  "score": 5,
  "created_at": "2026-03-31T10:00:00.000000Z",
  "updated_at": "2026-03-31T10:00:00.000000Z"
}
```

**Réponse erreur validation (422)**

```json
{
  "message": "Validation failed.",
  "errors": {
    "email": [
      "The email field must be a valid email address."
    ],
    "motivation": [
      "The motivation field must be at least 20 characters."
    ]
  }
}
```

### GET /api/applications

Retourne la liste des candidatures avec filtres et tri optionnels.

**Query params optionnels**

| Paramètre | Type | Valeurs | Description |
|---|---|---|---|
| `role` | `string` | `dev`, `designer` | Filtre par rôle |
| `sort` | `string` | `date`, `score` | Tri des résultats |

**Format de réponse JSON (200)**

```json
{
  "data": [
    {
      "id": 1,
      "nom": "Alice Martin",
      "email": "alice@example.com",
      "role": "dev",
      "score": 5,
      "created_at": "2026-03-31T10:00:00.000000Z",
      "updated_at": "2026-03-31T10:00:00.000000Z"
    }
  ],
  "total": 1
}
```

## Choix techniques

Le test recommandait Node.js/Express et Vue.js/Nuxt.js.
J'ai fait le choix délibéré d'utiliser un stack différent,
que je maîtrise mieux, afin de livrer une solution propre,
structurée et fonctionnelle dans les délais impartis.

- **Laravel 13**: framework PHP que je maîtrise en profondeur.
  Il offre une structure MVC claire, une validation native robuste,
  un ORM puissant (Eloquent) et une gestion des fichiers intégrée.
  Idéal pour construire une API REST propre rapidement.

- **Next.js**: framework React moderne avec App Router et TypeScript.
  Choisi pour sa flexibilité, ses performances et ma maîtrise du
  paradigme React par rapport à Vue.js.

- **MySQL**: base de données relationnelle parfaitement intégrée
  à Laravel via Eloquent. Choix naturel pour des données structurées
  comme des candidatures.

Une solution simple, maîtrisée et fonctionnelle reste toujours
préférable à une solution dans un stack imposé mais mal exécutée.

## Structure du projet

### Vue globale

```text
job-application-app/
├── backend/     # Projet Laravel 13
└── frontend/    # Projet Next.js
```

### Backend

```text
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/ApplicationController.php
│   │   └── Requests/StoreApplicationRequest.php
│   ├── Models/Application.php
│   └── Services/ScoringService.php
├── database/migrations/
└── routes/api.php
```

### Frontend

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── admin/page.tsx
│   ├── components/
│   │   ├── ApplicationForm.tsx
│   │   ├── ApplicationList.tsx
│   │   ├── ApplicationCard.tsx
│   │   ├── ScoreBadge.tsx
│   │   └── RoleBadge.tsx
│   ├── lib/api.ts
│   └── types/application.ts
```

## Améliorations possibles

- Authentification et autorisation pour la page admin
- Pagination de la liste des candidatures
- Notifications email à la soumission
- Export CSV des candidatures
- Gestion d’un statut de candidature (`en attente`, `acceptée`, `refusée`)
- Tableau de bord admin avec statistiques (volume, score moyen, répartition par rôle)

## Dépôt GitHub

- Nom du dépôt: **job-application-app**
- URL: `https://github.com/Wildev10/job-application-app`
