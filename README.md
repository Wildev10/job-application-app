# Vaybe Recrutement

Plateforme SaaS de recrutement pour les entreprises africaines. Fini les CV éparpillés entre WhatsApp, Facebook et les emails : chaque entreprise a son espace, son lien de candidature et un tableau de bord pour suivre chaque dossier.

![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000000?logo=nextdotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?logo=mysql&logoColor=white)

## Comment ça marche

1. Une entreprise s'inscrit, personnalise son espace (logo, couleur) et obtient un **lien unique** (`/apply/{slug}`), partageable partout : WhatsApp, Facebook, site web. Chaque poste a aussi son lien (`/apply/{slug}/{poste}`).
2. Les candidats remplissent un formulaire (nom, email, poste visé, motivation, portfolio, CV). La candidature arrive dans le tableau de bord, avec un **score automatique sur 5**.
3. Le RH fait avancer chaque dossier : *en attente → en examen → entretien prévu → accepté / refusé*. À chaque changement, le candidat reçoit **automatiquement un email**.
4. Le **plan Pro** (15 000 FCFA / mois, MTN ou Moov Mobile Money via FedaPay) lève les limites du plan Starter.
5. Le propriétaire de la plateforme dispose d'un **espace super admin** (`/superadmin`) : entreprises, statistiques, plans, suspension, impersonation, emails groupés.

### Plans

| | Starter | Pro |
|---|---|---|
| Postes actifs | 2 | illimités |
| Candidatures / mois | 50 | illimitées |
| Statistiques | 7 jours | 90 jours |
| Export CSV | non | oui |

### Score d'une candidature (sur 5)

Email valide, poste renseigné, CV fourni, mots-clés de motivation, et portfolio **ou** motivation détaillée (200 caractères ou plus).

## Prérequis

PHP >= 8.2, Composer, Node.js >= 18, MySQL 8.

## Installation

```bash
git clone https://github.com/Wildev10/job-application-app.git
cd job-application-app/backend
composer install
cp .env.example .env
php artisan key:generate
# configurer la base de données et SUPER_ADMIN_* dans .env, puis :
php artisan migrate --seed
php artisan storage:link
php artisan serve

cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

Le planificateur doit tourner en production (`* * * * * php artisan schedule:run`) : il expire les plans Pro échus et ferme les postes en trop des comptes Starter. Les emails groupés du super admin utilisent la file (`php artisan queue:work`).

## Variables d'environnement importantes (backend)

| Variable | Rôle |
|---|---|
| `APP_URL` | URL publique de l'API (liens de vérification, logos) |
| `APP_FRONTEND_URL` | URL du site (liens dans les emails) |
| `CORS_ALLOWED_ORIGINS` | Origines autorisées, séparées par des virgules |
| `SUPER_ADMIN_NAME` / `_EMAIL` / `_PASSWORD` | Compte créé par `db:seed` (rien n'est créé s'ils sont vides) |
| `FEDAPAY_SECRET_KEY` / `_PUBLIC_KEY` / `_ENVIRONMENT` | Accès FedaPay (`sandbox` ou `live`) |
| `FEDAPAY_WEBHOOK_SECRET` | Secret du webhook (obligatoire : sans lui tous les webhooks sont refusés) |
| `FEDAPAY_MOCK_MODE` | `true` en local uniquement : l'upgrade Pro devient gratuit |
| `PRO_PLAN_PRICE` | Prix du plan Pro **en FCFA** (défaut `15000`) |
| `MAIL_*` | SMTP pour les emails transactionnels |

Webhook FedaPay à déclarer : `POST {APP_URL}/api/payments/webhook`. La signature `t=<horodatage>,s=<hmac>` est vérifiée avec une tolérance de 5 minutes.

## Tests

`phpunit.xml` force SQLite. Si votre PHP n'a pas ce driver, utilisez une base MySQL dédiée (ne jamais viser la base de développement : les tests la vident) :

```bash
mysql -uroot -p -e 'CREATE DATABASE `job-application_test`'
cd backend
DB_CONNECTION=mysql DB_DATABASE=job-application_test php artisan test
```

## API (résumé)

**Public** : `POST /api/auth/register|login|forgot-password|reset-password` · `GET /api/company/{slug}` · `GET /api/jobs/public/{companySlug}/{jobSlug}` · `POST /api/applications/{companySlug}[/{jobSlug}]` · `POST /api/payments/webhook`

**Entreprise** (`Authorization: Bearer <token>`) : `/api/auth/me|logout|resend-verification` · `/api/jobs` (CRUD) · `/api/applications` (liste, détail, `/{id}/status`, `/{id}/cv`, `/export`, `/stats`) · `/api/company/profile|logo|plan-status|onboarding-status` · `/api/payments/initiate|history|status/{id}`

**Super admin** : `/api/superadmin/auth/login` puis `/api/superadmin/stats|companies|broadcast` (suspension, plan, impersonation, suppression).

## Sécurité

- CV stockés sur le disque privé, téléchargeables uniquement par l'entreprise propriétaire.
- Comptes suspendus refusés partout (connexion, API, formulaires).
- Limitation de débit sur l'inscription, la connexion, la réinitialisation du mot de passe et le dépôt de candidature.
- Isolation des données par entreprise vérifiée par les tests.
