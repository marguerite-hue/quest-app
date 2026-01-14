# Assets Management System

Ce système centralise la gestion de tous les assets du jeu (images, icônes, illustrations, etc.).

## 📁 Structure des Dossiers

```
src/assets/
├── images/          # Images générales (photos, uploads utilisateurs, etc.)
├── icons/           # Icônes UI (SVG, PNG)
├── illustrations/   # Illustrations de l'univers du jeu (carnet de quêtes, backgrounds, etc.)
└── index.js         # Registry central - exporte tous les assets
```

## 📝 Convention de Nommage

### Fichiers
- **kebab-case** pour les noms de fichiers
- Exemples :
  - `carnet-quetes.png`
  - `quest-book-open.png`
  - `village-background.jpg`
  - `icon-quest-completed.svg`

### Exports dans `index.js`
- **camelCase** pour les noms d'export
- Exemples :
  - `carnetQuetes` (fichier: `carnet-quetes.png`)
  - `questBookOpen` (fichier: `quest-book-open.png`)
  - `villageBackground` (fichier: `village-background.jpg`)

## ➕ Comment Ajouter un Nouvel Asset

### 1. Ajouter le fichier dans le bon dossier

```bash
# Exemple: Ajouter une illustration
src/assets/illustrations/carnet-quetes.png
```

### 2. Exporter dans `src/assets/index.js`

```javascript
// Dans src/assets/index.js
export { default as carnetQuetes } from './illustrations/carnet-quetes.png'
```

### 3. Utiliser dans un composant

```javascript
// Dans votre composant
import { carnetQuetes } from '@/assets'

function MyComponent() {
  return (
    <img src={carnetQuetes} alt="Carnet de quêtes" />
  )
}
```

## 🗂️ Où Placer Chaque Type d'Asset

### `images/`
- Photos générales
- Images uploadées par les utilisateurs
- Placeholders
- Avatars par défaut

**Exemple :**
- `default-avatar.png`
- `placeholder-quest.png`
- `user-upload-123.jpg`

### `icons/`
- Icônes UI (boutons, menus, etc.)
- Icônes de catégories
- Icônes de statut
- Préférence : **SVG** pour la scalabilité

**Exemple :**
- `icon-quest.svg`
- `icon-completed.svg`
- `icon-in-progress.svg`
- `icon-fitness.svg`

### `illustrations/`
- Illustrations de l'univers du jeu
- Backgrounds personnalisés
- Éléments décoratifs
- Assets spécifiques au thème Sims/Y2K

**Exemple :**
- `carnet-quetes.png`
- `quest-book-open.png`
- `village-background.png`
- `tent-decoration.png`

## ☁️ Supabase Storage (Assets Dynamiques)

Pour les assets qui peuvent être uploadés/modifiés dynamiquement, utilisez le **Asset Manager** :

### Configuration

1. Créer le bucket `game-assets` dans Supabase Dashboard > Storage
2. Configurer les politiques de sécurité (public read, authenticated write)

### Utilisation

```javascript
import { assetManager } from '@/utils/assetManager'

// Uploader un asset
const file = event.target.files[0]
const result = await assetManager.uploadAsset(
  file,
  'illustrations/custom-background.png',
  { upsert: true }
)
console.log('Asset URL:', result.url)

// Récupérer l'URL publique
const url = assetManager.getPublicUrl('illustrations/custom-background.png')

// Lister tous les assets
const assets = await assetManager.listAssets('illustrations')
```

## 📦 Exemples d'Utilisation

### Import simple (assets locaux)

```javascript
import { carnetQuetes, questBookOpen } from '@/assets'

function QuestBook() {
  return (
    <div>
      <img src={carnetQuetes} alt="Carnet" />
      <img src={questBookOpen} alt="Livre ouvert" />
    </div>
  )
}
```

### Import avec alias

Si vous avez configuré `@/assets` dans votre `vite.config.js` :

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}
```

### Assets dynamiques depuis Supabase

```javascript
import { getStorageAssetUrl } from '@/assets'

function DynamicImage({ assetPath }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    getStorageAssetUrl(assetPath).then(setUrl)
  }, [assetPath])

  return url ? <img src={url} alt="Dynamic asset" /> : <div>Loading...</div>
}
```

## 🔧 Configuration Vite (Optionnel)

Pour utiliser l'alias `@/assets`, ajoutez dans `vite.config.js` :

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## 📋 Checklist pour Nouveaux Assets

- [ ] Fichier nommé en kebab-case
- [ ] Placé dans le bon dossier (`images/`, `icons/`, `illustrations/`)
- [ ] Exporté dans `src/assets/index.js` en camelCase
- [ ] Testé l'import dans un composant
- [ ] Vérifié que l'image s'affiche correctement

## 🚀 Assets Recommandés pour le Projet

### Illustrations
- `carnet-quetes.png` - Grimoire de quêtes (version fermée)
- `quest-book-open.png` - Grimoire ouvert
- `village-background.png` - Background du village
- `tent-decoration.png` - Décoration de tente

### Icons
- `icon-quest.svg` - Icône de quête
- `icon-completed.svg` - Icône quête complétée
- `icon-in-progress.svg` - Icône quête en cours
- `icon-pending.svg` - Icône quête en attente

### Images
- `default-avatar.png` - Avatar par défaut
- `placeholder-quest.png` - Placeholder pour quêtes

## 💡 Bonnes Pratiques

1. **Optimisation** : Compressez les images avant de les ajouter
2. **Formats** :
   - PNG pour images avec transparence
   - JPG pour photos
   - SVG pour icônes (scalable)
   - WebP pour meilleure compression (si supporté)
3. **Taille** : Gardez les assets locaux < 500KB si possible
4. **Noms descriptifs** : Utilisez des noms clairs et explicites
5. **Versioning** : Pour les assets qui changent, utilisez Supabase Storage

## 🔗 Liens Utiles

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Vite Asset Handling](https://vitejs.dev/guide/assets.html)
