-- Create user_follows table for companion system
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- Enable RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone authenticated can view follows
CREATE POLICY "authenticated_users_read_follows" ON user_follows
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can follow others
CREATE POLICY "users_can_follow" ON user_follows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "users_can_unfollow" ON user_follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Add comment
COMMENT ON TABLE user_follows IS 'Tracks user relationships - who follows whom';
