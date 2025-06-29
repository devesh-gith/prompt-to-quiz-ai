
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function handleCorsPreflightRequest() {
  return new Response(null, { headers: corsHeaders });
}

export function createErrorResponse(error: string, status: number = 500) {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export function createSuccessResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
