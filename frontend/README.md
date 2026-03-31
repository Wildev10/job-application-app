# Frontend - Next.js

Interface de soumission et de consultation des candidatures.

## Prerequis

- Node.js >= 18
- npm ou yarn
- Backend Laravel lance sur http://localhost:8000

## Installation

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Variables d'environnement

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Pages

| Route | Fichier | Description |
|---|---|---|
| / | app/page.tsx | Formulaire de soumission de candidature |
| /admin | app/admin/page.tsx | Liste et consultation des candidatures |

## Composants

| Composant | Role |
|---|---|
| app/components/ApplicationForm.tsx | Formulaire complet avec validation |
| app/components/ApplicationList.tsx | Liste des candidatures avec filtres |
| app/components/ApplicationCard.tsx | Carte individuelle d'une candidature |
| app/components/ScoreBadge.tsx | Affichage visuel du score /5 |
| app/components/RoleBadge.tsx | Badge du role (dev / designer) |

## Appels API centralises - app/lib/api.ts

| Fonction | Methode | Description |
|---|---|---|
| submitApplication(formData) | POST /api/applications | Soumettre une candidature |
| getApplications(params?) | GET /api/applications | Recuperer les candidatures |

## Structure des fichiers

```text
frontend/
├── app/
│   ├── page.tsx
│   ├── admin/
│   │   └── page.tsx
│   ├── components/
│   │   ├── ApplicationForm.tsx
│   │   ├── ApplicationList.tsx
│   │   ├── ApplicationCard.tsx
│   │   ├── ScoreBadge.tsx
│   │   └── RoleBadge.tsx
│   ├── lib/
│   │   └── api.ts
│   ├── types/
│   │   └── application.ts
│   ├── globals.css
│   └── layout.tsx
└── .env.local
```

## Dependances notables

| Package | Usage |
|---|---|
| sweetalert2 | Alertes succes et erreurs serveur |
| next/font/google | Police Inter ou Plus Jakarta Sans |
| tailwindcss | Styles et responsive |

## Commandes utiles

```bash
npm run dev      # lancer en developpement
npm run build    # builder pour la production
npm run lint     # verifier le code
```
