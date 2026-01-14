# Design System - Border Radius Guidelines

## Système de Border Radius Cohérent

Pour maintenir une cohérence visuelle harmonieuse dans toute l'application, utilisez les valeurs suivantes :

### `rounded-3xl` (24px / 1.5rem)
**Utilisation :** Cartes principales, modals, sections principales, boutons principaux
- Cartes glass-card principales
- Modals complets
- Sections de contenu principales
- Boutons d'action principaux
- Barre de stats
- Encart "Écho du Village"

### `rounded-2xl` (16px / 1rem)
**Utilisation :** Éléments moyens, badges, tags, boutons de navigation, éléments de liste
- Boutons de navigation (nav-button)
- Badges et tags
- Éléments de liste dans les modals
- Titre du header
- Notifications individuelles

### `rounded-full` (50%)
**Utilisation :** Éléments circulaires uniquement
- Avatars
- Boutons pill-button (forme de pilule)
- Icônes circulaires
- Overlays circulaires

## Exemples d'utilisation

```jsx
// Carte principale
<div className="glass-card rounded-3xl p-6">

// Badge/Tag
<span className="glass-card px-3 py-1 rounded-2xl">

// Bouton de navigation
<button className="nav-button rounded-2xl">

// Avatar
<div className="rounded-full w-48 h-48">
```

## Règles à suivre

1. **Ne mélangez pas les tailles** : Utilisez la même taille pour des éléments similaires
2. **Hiérarchie visuelle** : Les éléments plus grands (cartes) utilisent `rounded-3xl`, les éléments moyens utilisent `rounded-2xl`
3. **Circulaire uniquement** : Réservez `rounded-full` aux éléments vraiment circulaires
