
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://kvnpcqisowlqvdumkczc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Setting up cron job for archiving expired orders");
    
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      }
    });
    
    // SQL to enable required extensions if not already enabled
    const { error: extensionError } = await supabase.rpc('setup_archiving_extensions');
    
    if (extensionError) {
      throw new Error(`Error enabling extensions: ${extensionError.message}`);
    }
    
    // SQL to create or replace the cron job
    const { error: cronError } = await supabase.rpc('setup_archive_cron_job', {
      function_url: `${SUPABASE_URL}/functions/v1/archive-expired-orders`,
      anon_key: SUPABASE_ANON_KEY
    });
    
    if (cronError) {
      throw new Error(`Error setting up cron job: ${cronError.message}`);
    }
    
    console.log("Successfully set up cron job for archiving expired orders");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully set up cron job for archiving expired orders" 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error(`Error in setup-cron-job function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
