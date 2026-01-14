-- Allow all authenticated users to read all user profiles
-- This is needed for the Grand Registre (User Registry) to display all players

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "All authenticated users can view all profiles" ON user_profiles;

-- Create policy: All authenticated users can read all profiles
CREATE POLICY "All authenticated users can view all profiles" ON user_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Also check if username and email columns exist, if not add them
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
END $$;
