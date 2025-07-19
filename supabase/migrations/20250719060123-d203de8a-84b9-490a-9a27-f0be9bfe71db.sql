-- Add attempt_limit field to shared_quizzes table
ALTER TABLE shared_quizzes 
ADD COLUMN attempt_limit VARCHAR(20) DEFAULT 'multiple' CHECK (attempt_limit IN ('once', 'multiple'));

-- Add comment for clarity
COMMENT ON COLUMN shared_quizzes.attempt_limit IS 'Whether members can take the quiz once or multiple times';

-- Update existing rows to have the default value
UPDATE shared_quizzes SET attempt_limit = 'multiple' WHERE attempt_limit IS NULL;