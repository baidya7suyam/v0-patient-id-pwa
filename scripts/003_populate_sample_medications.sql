-- Insert sample prescriptions and medication logs for testing
-- This script creates realistic medication data for demonstration

-- Insert sample prescriptions for the first patient
INSERT INTO prescriptions (
  patient_id,
  medication_name,
  dosage,
  frequency,
  instructions,
  start_date,
  end_date,
  status,
  prescribed_by,
  side_effects
) VALUES 
-- Active medications
(
  (SELECT id FROM patients LIMIT 1),
  'Lisinopril',
  '10mg',
  'Once daily',
  'Take with or without food, preferably at the same time each day',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days',
  'active',
  'Dr. Sarah Johnson',
  'Dizziness, dry cough, headache'
),
(
  (SELECT id FROM patients LIMIT 1),
  'Metformin',
  '500mg',
  'Twice daily',
  'Take with meals to reduce stomach upset',
  CURRENT_DATE - INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '90 days',
  'active',
  'Dr. Michael Chen',
  'Nausea, diarrhea, metallic taste'
),
(
  (SELECT id FROM patients LIMIT 1),
  'Vitamin D3',
  '1000 IU',
  'Once daily',
  'Take with a meal containing fat for better absorption',
  CURRENT_DATE - INTERVAL '90 days',
  NULL,
  'active',
  'Dr. Sarah Johnson',
  NULL
),
-- Completed medication
(
  (SELECT id FROM patients LIMIT 1),
  'Amoxicillin',
  '500mg',
  'Three times daily',
  'Take every 8 hours with food. Complete full course even if feeling better',
  CURRENT_DATE - INTERVAL '21 days',
  CURRENT_DATE - INTERVAL '11 days',
  'completed',
  'Dr. Emily Rodriguez',
  'Nausea, diarrhea, rash'
);

-- Create medication logs for today and recent days
-- This generates realistic medication schedules

DO $$
DECLARE
  patient_record RECORD;
  prescription_record RECORD;
  log_date DATE;
  log_time TIME;
  taken_probability FLOAT;
BEGIN
  -- Get the first patient
  SELECT id INTO patient_record FROM patients LIMIT 1;
  
  -- Generate logs for the last 7 days including today
  FOR i IN 0..6 LOOP
    log_date := CURRENT_DATE - INTERVAL '1 day' * i;
    
    -- For each active prescription
    FOR prescription_record IN 
      SELECT id, medication_name, frequency 
      FROM prescriptions 
      WHERE patient_id = patient_record.id 
      AND status = 'active'
    LOOP
      -- Generate medication times based on frequency
      CASE prescription_record.frequency
        WHEN 'Once daily' THEN
          log_time := '08:00:00';
          taken_probability := CASE WHEN i = 0 THEN 0.7 ELSE 0.85 END; -- Lower adherence today
          
          INSERT INTO medication_logs (
            patient_id,
            prescription_id,
            scheduled_time,
            taken,
            taken_at
          ) VALUES (
            patient_record.id,
            prescription_record.id,
            log_date + log_time,
            RANDOM() < taken_probability,
            CASE WHEN RANDOM() < taken_probability 
              THEN log_date + log_time + INTERVAL '5 minutes' * RANDOM()
              ELSE NULL 
            END
          );
          
        WHEN 'Twice daily' THEN
          -- Morning dose
          log_time := '08:00:00';
          taken_probability := CASE WHEN i = 0 THEN 0.8 ELSE 0.9 END;
          
          INSERT INTO medication_logs (
            patient_id,
            prescription_id,
            scheduled_time,
            taken,
            taken_at
          ) VALUES (
            patient_record.id,
            prescription_record.id,
            log_date + log_time,
            RANDOM() < taken_probability,
            CASE WHEN RANDOM() < taken_probability 
              THEN log_date + log_time + INTERVAL '10 minutes' * RANDOM()
              ELSE NULL 
            END
          );
          
          -- Evening dose
          log_time := '20:00:00';
          taken_probability := CASE WHEN i = 0 THEN 0.6 ELSE 0.85 END;
          
          INSERT INTO medication_logs (
            patient_id,
            prescription_id,
            scheduled_time,
            taken,
            taken_at
          ) VALUES (
            patient_record.id,
            prescription_record.id,
            log_date + log_time,
            RANDOM() < taken_probability,
            CASE WHEN RANDOM() < taken_probability 
              THEN log_date + log_time + INTERVAL '15 minutes' * RANDOM()
              ELSE NULL 
            END
          );
          
        WHEN 'Three times daily' THEN
          -- Only for completed prescriptions in the past
          IF log_date >= CURRENT_DATE - INTERVAL '21 days' AND log_date <= CURRENT_DATE - INTERVAL '11 days' THEN
            -- Morning, afternoon, evening doses
            FOR dose_time IN SELECT unnest(ARRAY['08:00:00'::TIME, '14:00:00'::TIME, '20:00:00'::TIME]) LOOP
              INSERT INTO medication_logs (
                patient_id,
                prescription_id,
                scheduled_time,
                taken,
                taken_at
              ) VALUES (
                patient_record.id,
                prescription_record.id,
                log_date + dose_time,
                RANDOM() < 0.95, -- High adherence for antibiotics
                CASE WHEN RANDOM() < 0.95 
                  THEN log_date + dose_time + INTERVAL '5 minutes' * RANDOM()
                  ELSE NULL 
                END
              );
            END LOOP;
          END IF;
      END CASE;
    END LOOP;
  END LOOP;
END $$;

-- Add some future medication logs for today (remaining doses)
INSERT INTO medication_logs (
  patient_id,
  prescription_id,
  scheduled_time,
  taken,
  taken_at
) 
SELECT 
  p.id as patient_id,
  pr.id as prescription_id,
  CURRENT_DATE + '14:00:00'::TIME as scheduled_time,
  false as taken,
  NULL as taken_at
FROM patients p
CROSS JOIN prescriptions pr
WHERE pr.patient_id = p.id 
  AND pr.status = 'active'
  AND pr.frequency = 'Twice daily'
  AND p.id = (SELECT id FROM patients LIMIT 1);

INSERT INTO medication_logs (
  patient_id,
  prescription_id,
  scheduled_time,
  taken,
  taken_at
) 
SELECT 
  p.id as patient_id,
  pr.id as prescription_id,
  CURRENT_DATE + '20:00:00'::TIME as scheduled_time,
  false as taken,
  NULL as taken_at
FROM patients p
CROSS JOIN prescriptions pr
WHERE pr.patient_id = p.id 
  AND pr.status = 'active'
  AND pr.frequency IN ('Once daily', 'Twice daily')
  AND p.id = (SELECT id FROM patients LIMIT 1);
