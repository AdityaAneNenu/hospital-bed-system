-- Hospital Bed Tracker Database Setup
-- Run these commands in your Supabase SQL Editor

-- 1. Create hospitals table
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create availability table
CREATE TABLE availability (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    available_beds INTEGER NOT NULL DEFAULT 0,
    available_oxygen INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hospital_id)
);

-- 3. Create profiles table for user roles
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insert sample hospital data
INSERT INTO hospitals (name, address, latitude, longitude) VALUES
('City General Hospital', '123 Main St, Downtown', 40.7128, -74.0060),
('Regional Medical Center', '456 Oak Ave, Midtown', 40.7589, -73.9851),
('Community Health Hospital', '789 Pine Rd, Uptown', 40.7831, -73.9712),
('Emergency Care Facility', '321 Elm St, Westside', 40.7505, -73.9934),
('Metropolitan Hospital', '654 Maple Dr, Eastside', 40.7282, -73.9942);

-- 5. Insert sample availability data
INSERT INTO availability (hospital_id, available_beds, available_oxygen) VALUES
(1, 15, 25),
(2, 8, 12),
(3, 22, 35),
(4, 5, 8),
(5, 18, 28);

-- 6. Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for hospitals table (readable by everyone)
CREATE POLICY "Hospitals are viewable by everyone" ON hospitals
    FOR SELECT USING (true);

-- 8. Create policies for availability table
CREATE POLICY "Availability is viewable by everyone" ON availability
    FOR SELECT USING (true);

CREATE POLICY "Availability can be updated by admins" ON availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 9. Create policies for profiles table
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 10. Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, 'patient');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
