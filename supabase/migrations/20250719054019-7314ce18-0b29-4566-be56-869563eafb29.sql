-- Drop the existing foreign key constraint that only references quizzes table
ALTER TABLE quiz_results DROP CONSTRAINT quiz_results_quiz_id_fkey;

-- Add a new constraint that allows quiz_id to reference either quizzes or shared_quizzes
-- We'll create a check constraint instead since PostgreSQL doesn't support OR in foreign keys
ALTER TABLE quiz_results ADD CONSTRAINT quiz_results_quiz_id_check 
CHECK (
  EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id) OR 
  EXISTS (SELECT 1 FROM shared_quizzes WHERE id = quiz_id)
);

-- Enable realtime for quiz_results table so dashboard updates automatically
ALTER TABLE quiz_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_results;