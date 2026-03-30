# CRM Immo Pro — Comparatif SaaS Immobilier

Application web de comparaison de logiciels CRM pour l'immobilier, déployée automatiquement sur Netlify.

## 🚀 Déploiement automatique

Le site se déploie automatiquement sur **Netlify** à chaque push sur `main` via GitHub Actions.

### Prérequis

Ajoutez ces deux **secrets** dans **Settings → Secrets and variables → Actions** de votre dépôt GitHub :

| Secret               | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `NETLIFY_AUTH_TOKEN`  | Token d'accès personnel Netlify ([créer ici](https://app.netlify.com/user/applications/personal)) |
| `NETLIFY_SITE_ID`    | ID du site Netlify (visible dans **Site configuration → General**)          |

### Étapes de configuration

1. **Créer un site sur Netlify** :
   - Allez sur [app.netlify.com](https://app.netlify.com)
   - Cliquez sur **Add new site → Import an existing project**
   - Connectez votre dépôt GitHub
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
   - Cliquez **Deploy site**

2. **Récupérer le Site ID** :
   - Dans Netlify : **Site configuration → General → Site ID**
   - Copiez la valeur

3. **Créer un token Netlify** :
   - Dans Netlify : **User settings → Applications → Personal access tokens**
   - Créez un nouveau token

4. **Ajouter les secrets GitHub** :
   - Allez dans les **Settings** de votre dépôt GitHub
   - **Secrets and variables → Actions → New repository secret**
   - Ajoutez `NETLIFY_AUTH_TOKEN` et `NETLIFY_SITE_ID`

5. **C'est prêt !** Chaque push sur `main` déclenchera un déploiement automatique. Les PRs recevront un commentaire avec un lien de preview.

## 📂 Structure du projet

```
.
├── index.html                  # Point d'entrée HTML
├── src/
│   ├── main.tsx                # Point d'entrée React
│   ├── App.tsx                 # Composant principal (toutes les sections)
│   └── index.css               # Styles globaux + variables CSS
├── public/
│   └── favicon.svg             # Favicon
├── vite.config.ts              # Configuration Vite + Tailwind CSS
├── tsconfig.json               # Configuration TypeScript
├── netlify.toml                # Configuration Netlify (build + headers)
├── package.json                # Dépendances et scripts
└── .github/
    └── workflows/
        └── netlify-deploy.yml  # Déploiement automatique via GitHub Actions
```

## 🔒 Sécurité

Les en-têtes de sécurité suivants sont automatiquement appliqués :

- **X-Frame-Options: DENY** — Protection contre le clickjacking
- **X-Content-Type-Options: nosniff** — Empêche le MIME sniffing
- **Referrer-Policy** — Contrôle des informations de référent
- **Permissions-Policy** — Désactive caméra, micro, géolocalisation
- **X-XSS-Protection** — Protection XSS basique

## 🏃 Développement local

```bash
npm install
npm run dev
```

Le site sera accessible sur `http://localhost:5173`.

## 🔨 Build

```bash
npm run build
```

Les fichiers de production sont générés dans le dossier `dist/`.
