-- Auto-create profile and patient record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    'patient' -- Default role for new signups
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into patients table for patient role users
  INSERT INTO public.patients (
    id, 
    patient_id,
    date_of_birth,
    gender,
    nfc_id,
    qr_code
  )
  VALUES (
    NEW.id,
    'P' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0'), -- Generate unique patient ID
    COALESCE((NEW.raw_user_meta_data ->> 'date_of_birth')::DATE, NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'gender', NULL),
    'NFC_' || NEW.id::TEXT, -- Generate NFC ID
    'QR_' || NEW.id::TEXT   -- Generate QR code
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize rewards for new patients
  INSERT INTO public.rewards (patient_id, points, level, streak_days)
  VALUES (NEW.id, 0, 1, 0)
  ON CONFLICT (patient_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
