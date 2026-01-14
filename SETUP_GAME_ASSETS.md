# Setup Game Assets Bucket

Ce guide explique comment créer automatiquement le bucket `game-assets` dans Supabase Storage.

## 🚀 Méthode 1: Script Automatique (Le plus simple)

### Via npm script

```bash
npm run setup:assets
```

Ce script va automatiquement appliquer la migration SQL pour créer le bucket.

### Via script bash direct

```bash
bash scripts/setup-assets-bucket.sh
```

## 🚀 Méthode 2: Migration SQL Manuelle

### Option A: Via Supabase Dashboard

1. Ouvrez votre projet Supabase Dashboard
2. Allez dans **SQL Editor** → **New Query**
3. Ouvrez le fichier `CREATE_GAME_ASSETS_BUCKET.sql`
4. Copiez tout le contenu et collez-le dans l'éditeur SQL
5. Cliquez sur **Run** (ou `Cmd/Ctrl + Enter`)

### Option B: Via Supabase CLI

Si vous utilisez Supabase CLI localement :

```bash
# Appliquer la migration
supabase db push

# Ou exécuter directement
supabase db execute -f supabase/migrations/20260112000000_create_game_assets_bucket.sql
```

## ✅ Vérification

Après avoir exécuté le SQL, vérifiez que le bucket existe :

1. Allez dans **Storage** dans le dashboard Supabase
2. Vous devriez voir le bucket `game-assets` dans la liste
3. Il doit être marqué comme **Public**

## 🔧 Utilisation dans le Code

Une fois le bucket créé, vous pouvez utiliser l'Asset Manager :

```javascript
import { assetManager } from '@/utils/assetManager'

// Vérifier que le bucket existe
try {
  await assetManager.ensureBucket()
  console.log('Bucket ready!')
} catch (error) {
  console.error('Please run CREATE_GAME_ASSETS_BUCKET.sql first')
}

// Uploader un asset
const result = await assetManager.uploadAsset(
  file,
  'illustrations/carnet-quetes.png'
)

// Récupérer l'URL
const url = assetManager.getPublicUrl('illustrations/carnet-quetes.png')
```

## 📋 Ce que le SQL crée

1. **Bucket `game-assets`** : Bucket public pour stocker tous les assets du jeu
2. **Politiques de sécurité** :
   - ✅ Lecture publique (tous les assets sont accessibles)
   - ✅ Upload pour utilisateurs authentifiés
   - ✅ Update pour utilisateurs authentifiés
   - ✅ Delete pour utilisateurs authentifiés

## 🗂️ Structure des dossiers dans le bucket

Le bucket supporte une structure de dossiers :

```
game-assets/
├── images/          # Images générales
├── icons/           # Icônes UI
└── illustrations/   # Illustrations du jeu
```

## ⚠️ Dépannage

### Erreur: "Bucket not found"

**Solution** : Exécutez `CREATE_GAME_ASSETS_BUCKET.sql` dans Supabase SQL Editor

### Erreur: "Permission denied"

**Solution** : Vérifiez que les politiques RLS sont correctement configurées dans le SQL

### Erreur: "Bucket already exists"

**Solution** : C'est normal si le bucket existe déjà. Le SQL utilise `ON CONFLICT DO NOTHING` pour éviter les erreurs.

## 🔗 Fichiers liés

- `CREATE_GAME_ASSETS_BUCKET.sql` - Script SQL standalone
- `supabase/migrations/20260112000000_create_game_assets_bucket.sql` - Migration versionnée
- `src/utils/assetManager.js` - Helper pour gérer les assets
- `src/utils/setupAssetsBucket.js` - Script de vérification
