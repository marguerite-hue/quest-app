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
