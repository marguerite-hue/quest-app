# 🚀 Guide de Déploiement en Production

Ce guide vous aidera à déployer votre application Quest App en production pour que vos amis puissent la rejoindre.

## 📋 Prérequis

1. ✅ Un compte Supabase (déjà configuré)
2. ✅ Un compte GitHub (pour déployer facilement)
3. ✅ Les variables d'environnement Supabase

## 🎯 Option 1 : Déploiement avec Vercel (Recommandé - Gratuit)

Vercel est la solution la plus simple et rapide pour déployer une app Vite/React.

### Étape 1 : Préparer le projet

1. **Créer un fichier `.env.example`** (pour référence) :
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Vérifier que votre code est sur GitHub** :
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

### Étape 2 : Déployer sur Vercel

1. **Aller sur [vercel.com](https://vercel.com)** et créer un compte (ou se connecter avec GitHub)

2. **Cliquer sur "Add New Project"**

3. **Importer votre repository GitHub** :
   - Sélectionner le repo `QUEST-APP`
   - Cliquer sur "Import"

4. **Configurer les variables d'environnement** :
   - Dans la section "Environment Variables", ajouter :
     - `VITE_SUPABASE_URL` = votre URL Supabase (ex: `https://uxgejvkoevtexfquafgg.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY` = votre clé anonyme Supabase
   
   ⚠️ **Important** : Trouvez ces valeurs dans votre dashboard Supabase :
   - Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionner votre projet
   - Aller dans **Settings** → **API**
   - Copier `Project URL` et `anon public` key

5. **Configurer le build** :
   - Framework Preset : **Vite**
   - Build Command : `npm run build` (déjà configuré)
   - Output Directory : `dist` (déjà configuré)
   - Install Command : `npm install`

6. **Cliquer sur "Deploy"**

7. **Attendre le déploiement** (2-3 minutes)

8. **Votre app sera disponible** sur une URL comme : `https://quest-app-xxx.vercel.app`

### Étape 3 : Configurer un domaine personnalisé (Optionnel)

1. Dans Vercel, aller dans **Settings** → **Domains**
2. Ajouter votre domaine personnalisé
3. Suivre les instructions pour configurer le DNS

---

## 🎯 Option 2 : Déploiement avec Netlify (Alternative - Gratuit)

### Étape 1 : Préparer le projet

Même préparation que pour Vercel (code sur GitHub, variables d'environnement prêtes)

### Étape 2 : Déployer sur Netlify

1. **Aller sur [netlify.com](https://netlify.com)** et créer un compte

2. **Cliquer sur "Add new site" → "Import an existing project"**

3. **Connecter avec GitHub** et sélectionner votre repo

4. **Configurer le build** :
   - Build command : `npm run build`
   - Publish directory : `dist`
   - Base directory : (laisser vide)

5. **Ajouter les variables d'environnement** :
   - Aller dans **Site settings** → **Environment variables**
   - Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

6. **Cliquer sur "Deploy site"**

7. **Votre app sera disponible** sur une URL comme : `https://random-name-123.netlify.app`

---

## ✅ Vérifications Post-Déploiement

### 1. Vérifier Supabase Edge Function

Assurez-vous que votre fonction `generate-avatar` est déployée :

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **Edge Functions**
4. Vérifier que `generate-avatar` est déployée
5. Si non, suivre le guide dans `DEPLOY_FUNCTION_NOW.md`

### 2. Vérifier les Storage Buckets

Assurez-vous que les buckets suivants existent :
- ✅ `avatars` (pour les avatars des utilisateurs)
- ✅ `game-assets` (pour les assets du jeu)

Si non, suivre les guides dans `STORAGE_SETUP.md` et `SETUP_GAME_ASSETS.md`

### 3. Tester l'application

1. Ouvrir l'URL de production
2. Créer un compte
3. Tester :
   - ✅ Connexion/Inscription
   - ✅ Création de quête
   - ✅ Génération d'avatar
   - ✅ Affichage des compagnons
   - ✅ Affichage du Grand Registre

### 4. Configurer l'authentification Supabase

1. Aller dans **Authentication** → **URL Configuration**
2. Ajouter votre URL de production dans :
   - **Site URL** : `https://votre-app.vercel.app`
   - **Redirect URLs** : `https://votre-app.vercel.app/**`

---

## 🔐 Sécurité

### Variables d'environnement sensibles

⚠️ **Ne jamais commit** :
- `.env` (déjà dans `.gitignore`)
- `.env.local`
- Les clés API

✅ **Toujours utiliser** les variables d'environnement de la plateforme de déploiement

### Token HuggingFace

Le token HuggingFace est actuellement dans le code. Pour plus de sécurité, vous pouvez :
1. Le déplacer dans une variable d'environnement
2. L'ajouter comme secret dans Vercel/Netlify
3. L'utiliser via Supabase Edge Function (recommandé)

---

## 🐛 Dépannage

### L'app ne se connecte pas à Supabase

1. Vérifier que les variables d'environnement sont bien configurées
2. Vérifier que les URLs de redirection sont configurées dans Supabase
3. Vérifier la console du navigateur pour les erreurs

### Les avatars ne se génèrent pas

1. Vérifier que l'Edge Function `generate-avatar` est déployée
2. Vérifier que le secret `HUGGINGFACE_TOKEN` est configuré dans Supabase
3. Vérifier les logs de l'Edge Function dans Supabase Dashboard

### Les images ne s'affichent pas

1. Vérifier que les buckets Storage sont créés et publics
2. Vérifier les politiques RLS (Row Level Security)
3. Vérifier que les assets sont bien uploadés

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs dans Vercel/Netlify
2. Vérifier les logs dans Supabase Dashboard
3. Vérifier la console du navigateur (F12)

---

## 🎉 C'est prêt !

Une fois déployé, partagez l'URL avec vos amis et ils pourront rejoindre votre village ! 🏕️
