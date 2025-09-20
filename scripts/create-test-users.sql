-- Create test users with credentials
-- Note: These are test credentials for development only

-- Insert test patient user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'patient@test.com',
  '$2a$10$8K1p/a0dhrxSHxN1nByqhOxHl7mHkL2nZiKwQjKe9T4zOAOjOe/K2', -- password: patient123
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "patient"}',
  false,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert test staff user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'doctor@test.com',
  '$2a$10$8K1p/a0dhrxSHxN1nByqhOxHl7mHkL2nZiKwQjKe9T4zOAOjOe/K2', -- password: doctor123
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "staff"}',
  false,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create test hospital
INSERT INTO hospitals (
  id,
  name,
  address,
  phone,
  email,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'General Hospital',
  '123 Medical Center Dr, Healthcare City, HC 12345',
  '+1-555-0123',
  'info@generalhospital.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create profiles for the test users
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  phone,
  hospital_id,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'patient@test.com',
  'John Patient',
  'patient',
  '+1-555-0001',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  phone,
  hospital_id,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'doctor@test.com',
  'Dr. Sarah Smith',
  'staff',
  '+1-555-0002',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create test patient record
INSERT INTO patients (
  id,
  patient_id,
  date_of_birth,
  gender,
  blood_type,
  emergency_contact_name,
  emergency_contact_phone,
  allergies,
  medical_conditions,
  nfc_id,
  qr_code,
  insurance_info,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'P001',
  '1990-05-15',
  'Male',
  'O+',
  'Jane Patient',
  '+1-555-0003',
  ARRAY['Penicillin', 'Shellfish'],
  ARRAY['Hypertension'],
  'NFC001',
  'QR001',
  '{"provider": "HealthCare Plus", "policy_number": "HP123456789", "group_number": "GRP001"}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create test rewards for patient
INSERT INTO rewards (
  id,
  patient_id,
  points,
  level,
  badges,
  streak_days,
  total_medicines_taken,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  150,
  2,
  '["First Week", "Consistent Taker"]',
  7,
  21,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;
