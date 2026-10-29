-- ============================================
-- SETUP COMPLET : Affichoir avec réactions et commentaires
-- ============================================
-- Exécute ce script dans Supabase SQL Editor

-- ============================================
-- PARTIE 1 : Créer les tables
-- ============================================

-- Table pour les réactions sur les quêtes
CREATE TABLE IF NOT EXISTS quest_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, user_id, reaction_type)
);

-- Table pour les commentaires sur les quêtes
CREATE TABLE IF NOT EXISTS quest_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PARTIE 2 : Indexes pour performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_quest_reactions_quest_id ON quest_reactions(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_reactions_user_id ON quest_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_comments_quest_id ON quest_comments(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_comments_user_id ON quest_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_comments_created_at ON quest_comments(created_at DESC);

-- ============================================
-- PARTIE 3 : RLS policies pour quest_reactions
-- ============================================

ALTER TABLE quest_reactions ENABLE ROW LEVEL SECURITY;

-- Drop anciennes policies si elles existent
DROP POLICY IF EXISTS "allow_read_all_reactions" ON quest_reactions;
DROP POLICY IF EXISTS "allow_insert_own_reactions" ON quest_reactions;
DROP POLICY IF EXISTS "allow_delete_own_reactions" ON quest_reactions;

-- Créer les nouvelles policies
CREATE POLICY "allow_read_all_reactions" ON quest_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "allow_insert_own_reactions" ON quest_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_reactions" ON quest_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PARTIE 4 : RLS policies pour quest_comments
-- ============================================

ALTER TABLE quest_comments ENABLE ROW LEVEL SECURITY;

-- Drop anciennes policies si elles existent
DROP POLICY IF EXISTS "allow_read_all_comments" ON quest_comments;
DROP POLICY IF EXISTS "allow_insert_own_comments" ON quest_comments;
DROP POLICY IF EXISTS "allow_update_own_comments" ON quest_comments;
DROP POLICY IF EXISTS "allow_delete_own_comments" ON quest_comments;

-- Créer les nouvelles policies
CREATE POLICY "allow_read_all_comments" ON quest_comments
  FOR SELECT
  USING (true);

CREATE POLICY "allow_insert_own_comments" ON quest_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_update_own_comments" ON quest_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_comments" ON quest_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PARTIE 5 : Vérifications
-- ============================================

-- Vérifier que les tables existent
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN ('quest_reactions', 'quest_comments')
  AND table_schema = 'public';

-- Vérifier les policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('quest_reactions', 'quest_comments')
ORDER BY tablename, policyname;

-- Compter les quêtes existantes
SELECT 
  'Total quests' as info,
  COUNT(*) as count
FROM quests;

-- ============================================
-- DONE! ✅
-- ============================================
-- Les tables sont prêtes pour les réactions et commentaires
