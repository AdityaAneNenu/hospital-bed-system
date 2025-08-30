-- Add avatar_url column to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN avatar_url TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user profile picture stored in Supabase Storage';

-- Optional: Create an index for faster queries (if you plan to query by avatar_url)
-- CREATE INDEX idx_profiles_avatar_url ON profiles(avatar_url);

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
