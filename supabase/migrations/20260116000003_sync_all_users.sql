-- Synchroniser tous les utilisateurs de auth.users vers user_profiles
-- Cela garantit que tous les users apparaissent dans le registre

-- Insérer tous les utilisateurs manquants de auth.users dans user_profiles
INSERT INTO user_profiles (id, email, username, created_at)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'username',
    split_part(email, '@', 1)
  ) as username,
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles)
ON CONFLICT (id) DO NOTHING;

-- Mettre à jour les profils existants qui n'ont pas d'email/username
UPDATE user_profiles
SET 
  email = COALESCE(user_profiles.email, (
    SELECT email FROM auth.users WHERE auth.users.id = user_profiles.id
  )),
  username = COALESCE(user_profiles.username, (
    SELECT split_part(email, '@', 1) FROM auth.users WHERE auth.users.id = user_profiles.id
  ))
WHERE email IS NULL OR username IS NULL;

-- Vérifier le résultat
SELECT 
  COUNT(*) as total_users_in_auth,
  (SELECT COUNT(*) FROM user_profiles) as total_users_in_profiles
FROM auth.users;
