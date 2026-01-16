-- ============================================
-- QUEST UPDATES SYSTEM
-- ============================================
-- Permet aux utilisateurs de poster des updates sur leurs quêtes en cours
-- Ex: "J'ai lu 'Les Misérables' cette semaine pour ma quête de lecture!"

-- Create quest_updates table
CREATE TABLE IF NOT EXISTS quest_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'followers', 'private'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quest_updates_quest_id ON quest_updates(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_updates_user_id ON quest_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_quest_updates_created_at ON quest_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quest_updates_visibility ON quest_updates(visibility);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quest_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_quest_updates_updated_at ON quest_updates;
CREATE TRIGGER set_quest_updates_updated_at
BEFORE UPDATE ON quest_updates
FOR EACH ROW
EXECUTE FUNCTION update_quest_updates_updated_at();

-- ============================================
-- REACTIONS & COMMENTS FOR UPDATES
-- ============================================
-- Réutiliser les tables existantes en ajoutant support pour les updates

-- Add update_id to quest_reactions (nullable, for updates instead of quests)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quest_reactions' AND column_name = 'update_id') THEN
    ALTER TABLE quest_reactions ADD COLUMN update_id UUID REFERENCES quest_updates(id) ON DELETE CASCADE;
    -- Add check constraint: either quest_id OR update_id must be set, but not both
    ALTER TABLE quest_reactions ADD CONSTRAINT quest_or_update_reaction CHECK (
      (quest_id IS NOT NULL AND update_id IS NULL) OR 
      (quest_id IS NULL AND update_id IS NOT NULL)
    );
    -- Update unique constraint to include update_id
    ALTER TABLE quest_reactions DROP CONSTRAINT IF EXISTS quest_reactions_quest_id_user_id_reaction_type_key;
    CREATE UNIQUE INDEX IF NOT EXISTS unique_quest_reaction 
      ON quest_reactions(quest_id, user_id, reaction_type) 
      WHERE quest_id IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS unique_update_reaction 
      ON quest_reactions(update_id, user_id, reaction_type) 
      WHERE update_id IS NOT NULL;
  END IF;
END $$;

-- Add update_id to quest_comments (nullable, for updates instead of quests)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quest_comments' AND column_name = 'update_id') THEN
    ALTER TABLE quest_comments ADD COLUMN update_id UUID REFERENCES quest_updates(id) ON DELETE CASCADE;
    -- Add check constraint: either quest_id OR update_id must be set, but not both
    ALTER TABLE quest_comments ADD CONSTRAINT quest_or_update_comment CHECK (
      (quest_id IS NOT NULL AND update_id IS NULL) OR 
      (quest_id IS NULL AND update_id IS NOT NULL)
    );
  END IF;
END $$;

-- Add indexes for update reactions/comments
CREATE INDEX IF NOT EXISTS idx_quest_reactions_update_id ON quest_reactions(update_id) WHERE update_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quest_comments_update_id ON quest_comments(update_id) WHERE update_id IS NOT NULL;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE quest_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "authenticated_users_read_public_updates" ON quest_updates;
DROP POLICY IF EXISTS "users_can_insert_own_updates" ON quest_updates;
DROP POLICY IF EXISTS "users_can_update_own_updates" ON quest_updates;
DROP POLICY IF EXISTS "users_can_delete_own_updates" ON quest_updates;

-- Everyone can read public updates
CREATE POLICY "authenticated_users_read_public_updates" ON quest_updates
  FOR SELECT
  TO authenticated
  USING (visibility = 'public' OR user_id = auth.uid());

-- Users can create their own updates
CREATE POLICY "users_can_insert_own_updates" ON quest_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own updates
CREATE POLICY "users_can_update_own_updates" ON quest_updates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own updates
CREATE POLICY "users_can_delete_own_updates" ON quest_updates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update RLS policies for reactions and comments to handle updates
-- (Already covered by existing policies since we're reusing the same tables)

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE quest_updates IS 'User updates/posts about their ongoing quests';
COMMENT ON COLUMN quest_updates.quest_id IS 'The quest this update is about';
COMMENT ON COLUMN quest_updates.user_id IS 'The user who posted this update';
COMMENT ON COLUMN quest_updates.update_text IS 'The content of the update';
COMMENT ON COLUMN quest_updates.visibility IS 'Who can see this update: public, followers, private';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables exist
SELECT 'quest_updates' as table_name, count(*) as row_count FROM quest_updates
UNION ALL
SELECT 'quest_reactions' as table_name, count(*) as row_count FROM quest_reactions
UNION ALL
SELECT 'quest_comments' as table_name, count(*) as row_count FROM quest_comments;
