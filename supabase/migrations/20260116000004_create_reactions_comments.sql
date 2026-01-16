-- ============================================
-- Tables pour réactions et commentaires
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

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_quest_reactions_quest_id ON quest_reactions(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_reactions_user_id ON quest_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_comments_quest_id ON quest_comments(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_comments_user_id ON quest_comments(user_id);

-- RLS policies pour quest_reactions
ALTER TABLE quest_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_read_all_reactions" ON quest_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "allow_insert_own_reactions" ON quest_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_reactions" ON quest_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies pour quest_comments
ALTER TABLE quest_comments ENABLE ROW LEVEL SECURITY;

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
