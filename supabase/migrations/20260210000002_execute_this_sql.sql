-- ============================================
-- QUEST APP - PRODUCTION SETUP
-- ============================================
-- Exécutez ce script SQL dans Supabase Dashboard pour préparer l'app en production
-- 
-- Instructions:
-- 1. Aller sur https://supabase.com/dashboard
-- 2. Sélectionner votre projet
-- 3. Cliquer sur "SQL Editor"
-- 4. Cliquer sur "New query"
-- 5. Copier-coller TOUT ce fichier
-- 6. Cliquer sur "Run"
-- 7. Attendre le message de succès
--
-- Ce script fait 2 choses importantes:
-- A) Corrige la structure de la base de données (colonnes manquantes)
-- B) Optimise les performances et sécurité (RLS policies + indexes)
-- ============================================

-- ============================================
-- PARTIE A: FIX DE LA STRUCTURE
-- ============================================

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

-- Step 2: Add user_id column to quests table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quests' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE quests ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  
  -- Add updated_at column if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_quests_status_updated_at ON quests(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_quests_user_id_status ON quests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

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

-- ============================================
-- PARTIE B: OPTIMISATION RLS & SÉCURITÉ
-- ============================================

-- ============================================
-- QUESTS TABLE POLICIES
-- ============================================

-- Drop all existing policies on quests
DROP POLICY IF EXISTS "Allow all operations for quests" ON quests;
DROP POLICY IF EXISTS "Users can create their own quests" ON quests;
DROP POLICY IF EXISTS "Users can read all quests" ON quests;
DROP POLICY IF EXISTS "Users can update their own quests" ON quests;
DROP POLICY IF EXISTS "Users can delete their own quests" ON quests;
DROP POLICY IF EXISTS "Authenticated users can view all quests" ON quests;
DROP POLICY IF EXISTS "Users can insert their own quests" ON quests;

-- Create optimized policies
-- Policy 1: All authenticated users can view all quests (needed for feed and registry)
CREATE POLICY "Authenticated users can view all quests" ON quests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Users can insert their own quests
CREATE POLICY "Users can insert their own quests" ON quests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update only their own quests
CREATE POLICY "Users can update their own quests" ON quests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete only their own quests
CREATE POLICY "Users can delete their own quests" ON quests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- USER_PROFILES TABLE POLICIES
-- ============================================

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "All authenticated users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Create optimized policies
-- Policy 1: All authenticated users can view all profiles (needed for registry and feed)
CREATE POLICY "Authenticated users can view all profiles" ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update only their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- DONE! ✅
-- ============================================
-- Si aucune erreur, tout est prêt pour la production!
-- Vous pouvez maintenant tester l'app et la partager avec vos amis.
