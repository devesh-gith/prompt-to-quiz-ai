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

    // Get all quiz results for shared quizzes in this organization
    const { data: results, error } = await supabaseAdmin
      .from('quiz_results')
      .select(`
        id,
        quiz_id,
        user_id,
        score,
        total_questions,
        completed_at,
        answers,
        shared_quizzes!inner(
          id,
          title,
          quiz_type,
          organization_id
        )
      `)
      .eq('shared_quizzes.organization_id', organization_id)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }

    console.log('Fetched results:', results?.length || 0, 'quiz results');

    return new Response(
      JSON.stringify({ data: results || [] }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
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