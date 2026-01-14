-- Create the game-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-assets', 'game-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the game-assets bucket
-- Allow public read access to all game assets (images, icons, illustrations)
CREATE POLICY "Public read access to game assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-assets');

-- Allow authenticated users to upload game assets
-- Users can upload to any folder: images/, icons/, illustrations/
CREATE POLICY "Authenticated users can upload game assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'game-assets' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update game assets
CREATE POLICY "Authenticated users can update game assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'game-assets' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete game assets
CREATE POLICY "Authenticated users can delete game assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'game-assets' AND
  auth.role() = 'authenticated'
);
