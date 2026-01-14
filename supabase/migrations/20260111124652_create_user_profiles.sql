CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid references auth.users primary key,
  avatar_url text,
  avatar_universe text,
  avatar_description text,
  background_type text,
  background_value text,
  background_effect text,
  stickers jsonb default '[]'::jsonb,
  updated_at timestamp default now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
