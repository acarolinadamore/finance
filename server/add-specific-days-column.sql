-- Add missing specific_days column to routines table
ALTER TABLE routines
ADD COLUMN IF NOT EXISTS specific_days INTEGER[];

-- Add other potentially missing columns
ALTER TABLE routines
ADD COLUMN IF NOT EXISTS times_per_week INTEGER;

ALTER TABLE routines
ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

ALTER TABLE routines
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#8b5cf6';

ALTER TABLE routines
ADD COLUMN IF NOT EXISTS add_to_habit_tracking BOOLEAN DEFAULT FALSE;

-- Update existing rows to have the default color if they don't have one
UPDATE routines
SET color = '#8b5cf6'
WHERE color IS NULL;
