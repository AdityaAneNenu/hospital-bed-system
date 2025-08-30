-- Fix for "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor

-- Option 1: Create a simple policy that allows authenticated users full access
CREATE POLICY "Allow authenticated users full access to avatars" ON storage.objects
FOR ALL 
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Option 2: If above doesn't work, allow public access (less secure but works)
-- CREATE POLICY "Allow public access to avatars" ON storage.objects
-- FOR ALL 
-- TO public
-- USING (bucket_id = 'avatars')
-- WITH CHECK (bucket_id = 'avatars');

-- Option 3: Disable RLS entirely on storage.objects (for testing only)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
