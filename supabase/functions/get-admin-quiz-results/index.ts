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
    const { organization_id } = await req.json();

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'Organization ID is required' }),
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

    console.log('Fetching admin quiz results for organization:', organization_id);

    // First get all quiz results
    const { data: allResults, error: resultsError } = await supabaseAdmin
      .from('quiz_results')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(100);

    if (resultsError) {
      console.error('Error fetching quiz results:', resultsError);
      throw resultsError;
    }

    console.log('Fetched all quiz results:', allResults?.length || 0);

    if (!allResults || allResults.length === 0) {
      console.log('No quiz results found');
      return new Response(
        JSON.stringify({ data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get quiz IDs and fetch shared quizzes for this organization
    const quizIds = [...new Set(allResults.map(result => result.quiz_id))];
    
    const { data: organizationQuizzes, error: quizzesError } = await supabaseAdmin
      .from('shared_quizzes')
      .select('id, title, quiz_type, organization_id, attempt_limit')
      .in('id', quizIds)
      .eq('organization_id', organization_id);

    if (quizzesError) {
      console.error('Error fetching organization quizzes:', quizzesError);
      throw quizzesError;
    }

    console.log('Fetched organization quizzes:', organizationQuizzes?.length || 0);

    // Create a map for quick lookup
    const quizMap = new Map(organizationQuizzes?.map(quiz => [quiz.id, quiz]) || []);

    // Filter results to only include quizzes from this organization and add quiz details
    const results = allResults
      .filter(result => quizMap.has(result.quiz_id))
      .map(result => ({
        ...result,
        shared_quizzes: quizMap.get(result.quiz_id)
      }));

    console.log('Filtered results for organization:', results?.length || 0, 'quiz results');

    return new Response(
      JSON.stringify({ data: results || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-admin-quiz-results:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});