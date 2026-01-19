-- Migration script to create routines and routine_completions tables
-- Execute this in pgAdmin or using psql

-- Table: routines
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  period VARCHAR(20) CHECK (period IN ('morning', 'afternoon', 'night', 'any')),
  frequency VARCHAR(20) CHECK (frequency IN ('daily', 'weekly', 'custom')) NOT NULL,
  specific_days INTEGER[], -- Array of days: [0,1,2,3,4,5,6] for Sun-Sat
  times_per_week INTEGER,
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#8b5cf6',
  add_to_habit_tracking BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: routine_completions
CREATE TABLE IF NOT EXISTS routine_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(routine_id, completion_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_routines_is_active ON routines(is_active);
CREATE INDEX IF NOT EXISTS idx_routines_frequency ON routines(frequency);
CREATE INDEX IF NOT EXISTS idx_routine_completions_routine_id ON routine_completions(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_completions_date ON routine_completions(completion_date DESC);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions if needed (adjust username as needed)
-- GRANT ALL PRIVILEGES ON routines TO your_user;
-- GRANT ALL PRIVILEGES ON routine_completions TO your_user;
