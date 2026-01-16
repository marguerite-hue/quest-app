-- Add user_id column to quests table
-- This migration adds a user_id column to properly link quests to users

-- Add the user_id column (nullable initially to allow data migration)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);

-- Update existing quests to set user_id based on created_by email
-- This matches the email in created_by to the email in auth.users
UPDATE quests
SET user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = quests.created_by
  LIMIT 1
)
WHERE user_id IS NULL AND created_by IS NOT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN quests.user_id IS 'Foreign key to user_profiles.id - the user who created this quest';
