
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";
import * as base32 from "https://deno.land/std@0.192.0/encoding/base32.ts";
import * as crypto from "https://deno.land/std@0.192.0/crypto/mod.ts";
import * as qrcode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate a random secret
    const buffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${userId}-${Date.now()}-${crypto.randomUUID()}`)
    );
    const secret = base32.encode(new Uint8Array(buffer)).substring(0, 16);
    
    // Store the secret in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ two_factor_secret: secret })
      .eq('id', userId);
      
    if (error) {
      throw error;
    }
    
    // Generate QR code
    const user = await supabase.auth.admin.getUserById(userId);
    const email = user.data.user?.email || "user";
    const otpauth = `otpauth://totp/OTCDesk:${email}?secret=${secret}&issuer=OTCDesk`;
    const qrCode = await qrcode.toDataURL(otpauth);
    
    return new Response(
      JSON.stringify({ secret, qrCode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating TOTP:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
