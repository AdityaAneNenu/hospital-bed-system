# Supabase Setup Guide

## Step 2: Set Up Your Supabase Backend

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Choose an organization or create one
5. Fill in project details:
   - Name: `hospital-bed-tracker`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your location)
6. Click "Create new project"

### 2. Get API Keys
1. Once your project is created, go to Settings > API
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (long string starting with eyJ)

### 3. Create Database Tables

Go to the SQL Editor in your Supabase dashboard and run these commands:

#### Create hospitals table:
```sql
CREATE TABLE hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Create availability table:
```sql
CREATE TABLE availability (
  id SERIAL PRIMARY KEY,
  hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
  available_beds INTEGER NOT NULL DEFAULT 0,
  available_oxygen INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hospital_id)
);
```

#### Create profiles table:
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Create a trigger to auto-create profiles:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'patient');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### Insert sample hospital data:
```sql
INSERT INTO hospitals (name, address, latitude, longitude) VALUES
('City General Hospital', '123 Main St, Downtown', 40.7128, -74.0060),
('St. Mary Medical Center', '456 Oak Ave, Midtown', 40.7580, -73.9855),
('Metropolitan Emergency Hospital', '789 Pine Rd, Uptown', 40.7831, -73.9712);

INSERT INTO availability (hospital_id, available_beds, available_oxygen) VALUES
(1, 15, 25),
(2, 8, 12),
(3, 22, 30);
```

### 4. Enable User Sign-ups
1. Go to Authentication > Settings
2. Under "User Signups", ensure it's enabled
3. Set "Email Confirmations" to disabled for development (you can enable it later)

### 5. Set Row Level Security (RLS)
Run these commands in the SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for hospitals table (read-only for all authenticated users)
CREATE POLICY "Anyone can view hospitals" ON hospitals
  FOR SELECT USING (true);

-- Policies for availability table
CREATE POLICY "Anyone can view availability" ON availability
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update availability" ON availability
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 6. Create Environment Variables File
After completing the Supabase setup, create a `.env` file in your project root with:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase URL and anon key.

### 7. Create an Admin User
1. Go to Authentication > Users
2. Click "Add user"
3. Add an email and password
4. After creating the user, go to the SQL Editor and run:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';
```
Replace 'USER_ID_HERE' with the actual user ID from the Users table.
