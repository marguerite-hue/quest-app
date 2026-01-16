-- Optimize RLS policies for production
-- This ensures all tables have proper access control and can be queried efficiently

-- ============================================
-- QUESTS TABLE POLICIES
-- ============================================

-- Drop all existing policies on quests
DROP POLICY IF EXISTS "Allow all operations for quests" ON quests;
DROP POLICY IF EXISTS "Users can create their own quests" ON quests;
DROP POLICY IF EXISTS "Users can read all quests" ON quests;
DROP POLICY IF EXISTS "Users can update their own quests" ON quests;
DROP POLICY IF EXISTS "Users can delete their own quests" ON quests;

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
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Ensure updated_at column exists before creating index on it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quests' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quests ADD COLUMN updated_at timestamp with time zone default now();
  END IF;
END $$;

-- Create additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quests_status_updated_at ON quests(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_quests_user_id_status ON quests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- ============================================
-- HELPER FUNCTION: Get quest with user info
-- ============================================

-- This can be used in the future to optimize complex queries
-- For now, we'll use client-side joins
