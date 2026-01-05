
-- Insert crew health checkins with burnout risk patterns (values 1-5)
INSERT INTO crew_health_checkins (
  crew_member_name, mood, stress_level, sleep_quality, 
  energy_level, physical_health, social_interaction, 
  notes, vessel_id, created_at
) VALUES 
  -- Healthy crew member over time
  ('Carlos Silva', 5, 2, 4, 5, 5, 4, 'Feeling good today', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '7 days'),
  ('Carlos Silva', 4, 2, 4, 4, 4, 4, 'Normal day', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '5 days'),
  ('Carlos Silva', 4, 3, 3, 4, 4, 3, 'A bit tired', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '3 days'),
  -- Declining mental health - burnout risk
  ('Maria Santos', 3, 4, 2, 2, 3, 2, 'Long shift yesterday', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '6 days'),
  ('Maria Santos', 2, 5, 2, 2, 2, 1, 'Exhausted, need rest', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '4 days'),
  ('Maria Santos', 1, 5, 1, 1, 2, 1, 'Cannot sleep well, stressed', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '2 days'),
  ('Maria Santos', 1, 5, 1, 1, 1, 1, 'Feeling burned out', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '1 day'),
  -- Medium risk crew
  ('João Oliveira', 3, 4, 3, 3, 3, 3, 'Moderate stress', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '5 days'),
  ('João Oliveira', 3, 4, 3, 3, 3, 2, 'Need more rest', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '3 days'),
  ('João Oliveira', 2, 4, 2, 2, 3, 2, 'Work overload', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '1 day'),
  -- Healthy crew
  ('Ana Costa', 5, 1, 5, 5, 5, 5, 'Great day!', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '4 days'),
  ('Ana Costa', 5, 1, 5, 5, 5, 5, 'Feeling excellent', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '2 days'),
  ('Ana Costa', 5, 2, 5, 5, 5, 5, 'Good mood', 'a29cc6a3-18a8-4747-af89-59a9166bb864', NOW() - INTERVAL '1 day');
