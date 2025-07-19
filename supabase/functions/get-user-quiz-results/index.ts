import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create admin client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Fetching user quiz results for user:', user_id);

    // Get quiz results for this user
    const { data: userResults, error: resultsError } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (resultsError) {
      console.error('Error fetching user quiz results:', resultsError);
      throw resultsError;
    }

    console.log('Fetched user quiz results:', userResults?.length || 0);

    if (!userResults || userResults.length === 0) {
      console.log('No quiz results found for user');
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get quiz IDs and fetch shared quizzes details
    const quizIds = [...new Set(userResults.map(result => result.quiz_id))];
    
    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from('shared_quizzes')
      .select('id, title, quiz_type')
      .in('id', quizIds);

    if (quizzesError) {
      console.error('Error fetching quiz details:', quizzesError);
      throw quizzesError;
    }

    console.log('Fetched quiz details:', quizzes?.length || 0);

    // Create a map for quick lookup
    const quizMap = new Map(quizzes?.map(quiz => [quiz.id, quiz]) || []);

    // Add quiz details to results
    const results = userResults.map(result => ({
      ...result,
      shared_quizzes: quizMap.get(result.quiz_id)
    }));

    console.log('Final user results:', results?.length || 0, 'quiz results');

    return new Response(
      JSON.stringify({ data: results || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-user-quiz-results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});