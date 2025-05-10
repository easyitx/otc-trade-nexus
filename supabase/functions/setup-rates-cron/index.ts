
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const anon_key = Deno.env.get('SUPABASE_ANON_KEY') || '';
const project_ref = Deno.env.get('SUPABASE_PROJECT_REF') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Set up the function URL for the currency rates function
    const function_url = `https://${project_ref}.supabase.co/functions/v1/currency-rates?automated=true`;

    // Setup the cron job via SQL query - this requires the pg_cron extension
    const { data, error } = await supabase.rpc('setup_archive_cron_job', {
      function_url,
      anon_key
    });

    if (error) throw error;
    
    // Set up another cron job specifically for currency rates updates
    // This will run every 3 hours
    const { data: dbResult, error: dbError } = await supabase.query(`
      SELECT cron.schedule(
        'update-currency-rates-every-3-hours',
        '0 */3 * * *',
        $$ SELECT net.http_post(
          url:='${function_url}',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anon_key}"}'::jsonb,
          body:='{"automated": true}'::jsonb
        ) as request_id; $$
      );
    `);
    
    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cron jobs set up successfully for currency rates update" 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error setting up cron job:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
