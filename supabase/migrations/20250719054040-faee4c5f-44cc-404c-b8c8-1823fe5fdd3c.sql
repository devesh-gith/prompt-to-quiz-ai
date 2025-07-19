-- Drop the foreign key constraint completely since RLS policies handle access control
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_quiz_id_fkey;

-- Enable realtime for quiz_results table so dashboard updates automatically
ALTER TABLE quiz_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_results;