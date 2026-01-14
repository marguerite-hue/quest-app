# Uploader l'image du Carnet de Quêtes

Pour que tous les utilisateurs puissent voir l'image du carnet de quêtes, elle doit être uploadée dans Supabase Storage.

## 🚀 Méthode 1: Script automatique (Recommandé)

### Prérequis

1. Assurez-vous que le bucket `game-assets` existe :
   ```bash
   npm run setup:assets
   ```

2. Placez votre image dans le projet :
   ```
   src/assets/illustrations/carnet-quetes.png
   ```

3. Uploader l'image :
   ```bash
   npm run upload:quest-book
   ```

   Ou avec un chemin personnalisé :
   ```bash
   npm run upload:quest-book path/to/your/image.png
   ```

## 🚀 Méthode 2: Via Supabase Dashboard

1. Allez dans **Supabase Dashboard** → **Storage**
2. Ouvrez le bucket `game-assets`
3. Créez un dossier `illustrations` si il n'existe pas
4. Cliquez sur **Upload file**
5. Sélectionnez votre image `carnet-quetes.png`
6. Assurez-vous que le chemin est : `illustrations/carnet-quetes.png`

## ✅ Vérification

Après l'upload, l'image sera automatiquement disponible pour tous les utilisateurs à l'URL :
```
https://[votre-projet].supabase.co/storage/v1/object/public/game-assets/illustrations/carnet-quetes.png
```

L'application chargera automatiquement cette image depuis Supabase Storage.

## 🔧 Dépannage

### Erreur: "Bucket not found"
```bash
npm run setup:assets
```

### L'image ne s'affiche pas
1. Vérifiez que l'image est bien uploadée dans Supabase Storage
2. Vérifiez que le chemin est exactement `illustrations/carnet-quetes.png`
3. Vérifiez que le bucket est public
4. Ouvrez la console du navigateur pour voir les erreurs

### Fallback local
Si Supabase Storage n'est pas disponible, l'application utilisera automatiquement l'image locale (si elle existe dans `src/assets/illustrations/carnet-quetes.png`).
