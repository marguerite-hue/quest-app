# 🐛 Fix : Crash lors de la création de quêtes

## Problème identifié

L'application crashait ou déconnectait les utilisateurs lors de la création de quêtes. Causes principales :

1. **Conflit de colonnes** : Le code utilisait `user_id` pour lire les quêtes mais `created_by` (email) pour les créer
2. **Rechargement brutal** : `window.location.reload()` causait des pertes de session
3. **Gestion d'erreurs insuffisante** : Pas de messages clairs en cas d'échec

## Solution

### 1. Migration de la base de données (OBLIGATOIRE)

Pour corriger le problème, vous devez ajouter la colonne `user_id` à la table `quests`.

**Étapes :**

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet : `uxgejvkoevtexfquafgg`
3. Cliquer sur **SQL Editor** dans la barre latérale
4. Cliquer sur **New query**
5. Copier-coller le code SQL suivant :

```sql
-- Complete fix for quests and user_profiles
-- This migration ensures all necessary columns exist and data is properly linked

-- Step 1: Add username and email to user_profiles if they don't exist
DO $$ 
BEGIN
  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username text;
  END IF;

  -- Add email column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email text;
  END IF;
  
  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN created_at timestamp with time zone default now();
  END IF;
END $$;

-- Step 2: Add user_id and updated_at columns to quests table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quests' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE quests ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quests ADD COLUMN updated_at timestamp with time zone default now();
  END IF;
END $$;

-- Step 3: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Step 4: Update existing quests to set user_id based on created_by email
-- This matches the email in created_by to the email in auth.users
UPDATE quests
SET user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = quests.created_by
  LIMIT 1
)
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Step 5: Sync user_profiles with auth.users data
-- Update email and username from auth.users if not already set
UPDATE user_profiles
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = user_profiles.id
)
WHERE email IS NULL OR email = '';

-- Step 6: Set username from email if username is not set
UPDATE user_profiles
SET username = split_part(email, '@', 1)
WHERE (username IS NULL OR username = '') AND email IS NOT NULL;

-- Step 7: Add helpful comments
COMMENT ON COLUMN quests.user_id IS 'Foreign key to auth.users.id - the user who created this quest';
COMMENT ON COLUMN user_profiles.email IS 'Cached email from auth.users for easier queries';
COMMENT ON COLUMN user_profiles.username IS 'Display name for the user, defaults to email prefix';

-- Step 8: Create trigger to automatically update updated_at on quests
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_quests_updated_at ON quests;

CREATE TRIGGER update_quests_updated_at
  BEFORE UPDATE ON quests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 9: Initialize updated_at for existing quests (set to created_at)
UPDATE quests
SET updated_at = created_at
WHERE updated_at IS NULL;
```

6. Cliquer sur **Run** en bas à droite
7. Attendre le message de succès

### 2. Code corrigé

Les fichiers suivants ont été modifiés :

#### `src/AccountPage.jsx`

**Changements :**
- ✅ Ajout de `user_id` lors de la création de quêtes
- ✅ Vérification de la session utilisateur avant création
- ✅ Messages d'erreur plus détaillés
- ✅ Délai avant `reload()` pour éviter les crashes
- ✅ Support de `user_id` dans `loadVillageEchos()`
- ✅ Gestion de déconnexion automatique si session expirée

**Avant :**
```javascript
created_by: user?.email || 'unknown',
```

**Après :**
```javascript
user_id: user.id,
created_by: user?.email || 'unknown', // Gardé pour compatibilité
```

### 3. Test de la correction

Après avoir exécuté la migration SQL :

1. Rafraîchir l'application (`Cmd/Ctrl + R`)
2. Essayer de créer une nouvelle quête
3. Vérifier que :
   - ✅ La quête est créée sans crash
   - ✅ Un message de succès s'affiche
   - ✅ La page se recharge automatiquement
   - ✅ La nouvelle quête apparaît dans le carnet

### 4. En cas de problèmes persistants

Si vous rencontrez encore des erreurs :

#### Vérifier les RLS (Row Level Security)

1. Dans Supabase Dashboard, aller dans **Table Editor** → `quests`
2. Cliquer sur l'icône **⚙️** → **Edit Table** → **RLS policies**
3. S'assurer qu'il existe une policy permettant l'insertion :

```sql
-- Policy pour permettre aux utilisateurs authentifiés de créer des quêtes
CREATE POLICY "Users can create their own quests" ON quests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy pour lire toutes les quêtes
CREATE POLICY "Users can read all quests" ON quests
  FOR SELECT
  USING (true);
```

#### Vérifier la console du navigateur

1. Ouvrir les DevTools (`F12` ou `Cmd/Ctrl + Option/Alt + I`)
2. Aller dans l'onglet **Console**
3. Essayer de créer une quête
4. Noter les erreurs affichées (si présentes)

#### Messages d'erreur courants

| Message d'erreur | Solution |
|-----------------|----------|
| "Session expirée" | Se déconnecter et se reconnecter |
| "Erreur de permission" | Vérifier les RLS policies |
| "user_id is required" | S'assurer que la migration SQL a bien été exécutée |
| "Column 'user_id' does not exist" | Ré-exécuter la migration SQL |

### 5. Vérification technique

Pour vérifier que la migration a bien fonctionné, exécuter ces requêtes SQL :

```sql
-- Vérifier que user_id existe dans quests
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quests' AND column_name = 'user_id';

-- Vérifier que username et email existent dans user_profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name IN ('username', 'email', 'created_at')
ORDER BY column_name;

-- Vérifier que les quêtes ont été liées aux utilisateurs
SELECT 
  COUNT(*) as total_quests,
  COUNT(user_id) as quests_with_user_id,
  COUNT(*) - COUNT(user_id) as quests_without_user_id
FROM quests;
```

Résultat attendu :
- `user_id` existe dans `quests` (type: uuid)
- `username`, `email`, `created_at` existent dans `user_profiles`
- La plupart des quêtes devraient avoir un `user_id` (sauf celles créées avec des emails invalides)

---

## 🎉 Résultat

Après ces corrections :
- ✅ Les quêtes se créent sans crash
- ✅ La session reste active
- ✅ Les erreurs sont gérées proprement
- ✅ Les messages de feedback sont clairs
- ✅ Les données sont correctement liées aux utilisateurs

**Note importante :** Si vous avez déjà des quêtes dans la base, la migration tentera de les lier automatiquement aux utilisateurs en matchant les emails. Les quêtes créées sans `user_id` valable ne seront pas affichées correctement dans "Écho du Village".
