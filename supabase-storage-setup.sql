-- Supabase Storage Setup for Profile Pictures
-- IMPORTANT: Do NOT run the SQL policies below - use the UI instead!

-- Step 1: Create Storage Bucket via UI
-- Go to: Supabase Dashboard > Storage > New bucket
-- Name: "avatars" 
-- Public: ✅ Enable
-- Click "Create bucket"

-- Step 2: Set up Storage Policies via UI (NOT SQL)
-- Go to: Storage > avatars bucket > Configuration tab > Policies
-- Click "New Policy" and create these policies:

-- POLICY 1: Allow authenticated users to upload their own avatars
-- Template: "Users can insert their own files"
-- Policy name: "Users can upload their own avatar"
-- Target roles: authenticated
-- Additional conditions: folder = auth.uid()

-- POLICY 2: Allow anyone to view avatars (since bucket is public)
-- Template: "Anyone can view files" 
-- Policy name: "Anyone can view avatars"
-- Target roles: public, authenticated

-- POLICY 3: Allow users to update their own avatars
-- Template: "Users can update their own files"
-- Policy name: "Users can update their own avatar" 
-- Target roles: authenticated
-- Additional conditions: folder = auth.uid()

-- POLICY 4: Allow users to delete their own avatars
-- Template: "Users can delete their own files"
-- Policy name: "Users can delete their own avatar"
-- Target roles: authenticated  
-- Additional conditions: folder = auth.uid()

-- Alternative: Simple Public Bucket (Easier Setup)
-- If the above is too complex, you can simply:
-- 1. Create a public bucket named "avatars"
-- 2. Add one policy: "Anyone can upload, view, update files"
-- This is less secure but works for development/testing
