-- Insert achievement definitions and sample rewards data
-- This creates a comprehensive gamification system

-- Insert achievement definitions
INSERT INTO achievements (
  title,
  description,
  points,
  badge_icon,
  category,
  requirement_type,
  requirement_value
) VALUES 
-- Medication adherence achievements
('First Steps', 'Take your first medication dose', 10, '🎯', 'medication', 'medication_taken', 1),
('Getting Started', 'Complete your first day of medications', 25, '⭐', 'medication', 'daily_completion', 1),
('Consistent Care', 'Take medications for 3 days in a row', 50, '🔥', 'streak', 'medication_streak', 3),
('Week Warrior', 'Maintain a 7-day medication streak', 100, '💪', 'streak', 'medication_streak', 7),
('Two Week Champion', 'Keep up a 14-day medication streak', 200, '🏆', 'streak', 'medication_streak', 14),
('Monthly Master', 'Achieve a 30-day medication streak', 500, '👑', 'streak', 'medication_streak', 30),

-- Adherence rate achievements
('Good Habits', 'Maintain 80% adherence for a week', 75, '✅', 'medication', 'adherence_rate', 80),
('Excellence', 'Achieve 95% adherence for a month', 300, '🌟', 'medication', 'adherence_rate', 95),
('Perfect Record', 'Maintain 100% adherence for a week', 150, '💎', 'medication', 'adherence_rate', 100),

-- Point milestones
('Point Collector', 'Earn your first 100 points', 25, '🎁', 'milestone', 'total_points', 100),
('Rising Star', 'Accumulate 500 points', 50, '🚀', 'milestone', 'total_points', 500),
('High Achiever', 'Reach 1000 points', 100, '🎖️', 'milestone', 'total_points', 1000),
('Elite Status', 'Earn 2500 points', 250, '👑', 'milestone', 'total_points', 2500),

-- Special achievements
('Early Bird', 'Take morning medication on time for 5 days', 75, '🌅', 'special', 'morning_adherence', 5),
('Night Owl', 'Take evening medication on time for 5 days', 75, '🌙', 'special', 'evening_adherence', 5),
('Health Champion', 'Complete all daily medications for 10 days', 200, '🏅', 'special', 'daily_completion', 10);

-- Initialize rewards data for the first patient
INSERT INTO patient_rewards (
  patient_id,
  total_points,
  current_streak,
  longest_streak,
  last_medication_date
)
SELECT 
  id,
  150, -- Starting with some points
  5,   -- Current 5-day streak
  12,  -- Best streak was 12 days
  CURRENT_DATE
FROM patients 
LIMIT 1
ON CONFLICT (patient_id) DO UPDATE SET
  total_points = EXCLUDED.total_points,
  current_streak = EXCLUDED.current_streak,
  longest_streak = EXCLUDED.longest_streak,
  last_medication_date = EXCLUDED.last_medication_date;

-- Award some initial achievements
INSERT INTO patient_achievements (
  patient_id,
  achievement_id,
  earned_at
)
SELECT 
  p.id,
  a.id,
  CURRENT_TIMESTAMP - INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY a.points))
FROM patients p
CROSS JOIN achievements a
WHERE p.id = (SELECT id FROM patients LIMIT 1)
  AND a.title IN ('First Steps', 'Getting Started', 'Consistent Care', 'Point Collector')
ON CONFLICT (patient_id, achievement_id) DO NOTHING;

-- Create sample points transactions
INSERT INTO points_transactions (
  patient_id,
  points,
  reason,
  transaction_type
)
SELECT 
  p.id,
  10,
  'Daily medication completion',
  'earned'
FROM patients p
WHERE p.id = (SELECT id FROM patients LIMIT 1)
UNION ALL
SELECT 
  p.id,
  25,
  'Achievement: Getting Started',
  'earned'
FROM patients p
WHERE p.id = (SELECT id FROM patients LIMIT 1)
UNION ALL
SELECT 
  p.id,
  50,
  'Achievement: Consistent Care',
  'earned'
FROM patients p
WHERE p.id = (SELECT id FROM patients LIMIT 1)
UNION ALL
SELECT 
  p.id,
  25,
  'Achievement: Point Collector',
  'earned'
FROM patients p
WHERE p.id = (SELECT id FROM patients LIMIT 1)
UNION ALL
SELECT 
  p.id,
  5,
  'Medication taken on time',
  'earned'
FROM patients p
WHERE p.id = (SELECT id FROM patients LIMIT 1);

-- Add more historical transactions for the past week
INSERT INTO points_transactions (
  patient_id,
  points,
  reason,
  transaction_type,
  created_at
)
SELECT 
  p.id,
  (ARRAY[5, 10, 15, 20])[floor(random() * 4 + 1)],
  (ARRAY['Morning medication taken', 'Evening medication taken', 'Perfect daily adherence', 'Medication streak bonus'])[floor(random() * 4 + 1)],
  'earned',
  CURRENT_TIMESTAMP - INTERVAL '1 day' * generate_series(1, 7)
FROM patients p
WHERE p.id = (SELECT id FROM patients LIMIT 1);
