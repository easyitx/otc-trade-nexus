
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://kvnpcqisowlqvdumkczc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS headers for browser requests
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
    console.log("Starting archive-expired-orders function");
    
    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      }
    });
    
    // Get current timestamp in UTC
    const now = new Date().toISOString();
    
    // Query for active orders that have expired
    // We're looking for orders with:
    // 1. A status that is not ARCHIVED
    // 2. An expiration date in the past
    const { data: expiredOrders, error: queryError } = await supabase
      .from('orders')
      .select('id, expires_at')
      .neq('status', 'ARCHIVED')
      .lt('expires_at', now);
    
    if (queryError) {
      throw new Error(`Error querying expired orders: ${queryError.message}`);
    }
    
    console.log(`Found ${expiredOrders?.length || 0} expired orders to archive`);
    
    if (!expiredOrders || expiredOrders.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No expired orders found to archive", 
          archivedCount: 0 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Extract IDs of expired orders
    const expiredOrderIds = expiredOrders.map(order => order.id);
    
    // Update the status of all expired orders to ARCHIVED
    const { data: updateResult, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'ARCHIVED' })
      .in('id', expiredOrderIds)
      .select('id');
    
    if (updateError) {
      throw new Error(`Error archiving orders: ${updateError.message}`);
    }
    
    console.log(`Successfully archived ${updateResult?.length || 0} expired orders`);
    
    // Return success response with count of archived orders
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully archived ${updateResult?.length || 0} expired orders`, 
        archivedCount: updateResult?.length || 0,
        archivedOrderIds: updateResult?.map(order => order.id) || []
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error(`Error in archive-expired-orders function: ${error.message}`);
    
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
