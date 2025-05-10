import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  return null;
}

// Parse number from string, handling Russian decimal format
function parseRussianNumber(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

// Fetch currency rates from various sources
async function fetchCurrencyRates() {
  const rates: Record<string, Record<string, number>> = {
    USD: {},
    EUR: {},
    RUB: {},
    GBP: {},
    CNY: {},
    USDT: {}
  };
  
  try {
    // Fetch CBR (Central Bank of Russia) rates
    const cbrRates = await fetchCBRRates();
    
    if (cbrRates) {
      // Set USD/RUB rate from CBR
      rates.USD.RUB = cbrRates.USD;
      rates.RUB.USD = 1 / cbrRates.USD;
      
      // Set EUR/RUB rate from CBR
      rates.EUR.RUB = cbrRates.EUR;
      rates.RUB.EUR = 1 / cbrRates.EUR;
      
      // Set GBP/RUB rate from CBR
      if (cbrRates.GBP) {
        rates.GBP.RUB = cbrRates.GBP;
        rates.RUB.GBP = 1 / cbrRates.GBP;
      }
      
      // Set CNY/RUB rate from CBR
      if (cbrRates.CNY) {
        rates.CNY.RUB = cbrRates.CNY;
        rates.RUB.CNY = 1 / cbrRates.CNY;
      }
      
      // For USDT/RUB, we can approximate it similar to USD/RUB for now
      rates.USDT.RUB = rates.USD.RUB;
      rates.RUB.USDT = 1 / rates.USD.RUB;
    }
    
    return rates;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    return rates;
  }
}

// Fetch rates from CBR (Central Bank of Russia)
async function fetchCBRRates() {
  try {
    // In a production environment, you would parse the actual CBR website or use their API
    // For demo purposes, we're returning mock data
    return {
      USD: 91.45,
      EUR: 98.76,
      GBP: 114.23,
      CNY: 12.58
    };
    
    // Actual implementation would look something like this:
    /*
    const response = await fetch('https://www.cbr.ru/eng/currency_base/daily/');
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    const table = doc?.querySelector('.data');
    if (!table) return null;
    
    const rows = Array.from(table.querySelectorAll('tr'));
    
    const rates = {};
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td'));
      if (cells.length >= 5) {
        const currencyCode = cells[1].textContent.trim();
        const rateText = cells[4].textContent.trim().replace(',', '.');
        const rate = parseFloat(rateText);
        
        if (!isNaN(rate)) {
          rates[currencyCode] = rate;
        }
      }
    }
    
    return rates;
    */
  } catch (error) {
    console.error("Error fetching CBR rates:", error);
    return null;
  }
}

// Update rates in the database
async function updateRatesInDatabase(rates: Record<string, Record<string, number>>) {
  try {
    const timestamp = new Date().toISOString();
    const updates = [];
    
    for (const baseCurrency in rates) {
      for (const quoteCurrency in rates[baseCurrency]) {
        const rate = rates[baseCurrency][quoteCurrency];
        
        if (rate) {
          updates.push({
            base_currency: baseCurrency,
            quote_currency: quoteCurrency,
            auto_rate: rate,
            source: 'CBR',
            source_timestamp: timestamp,
            last_updated: timestamp
          });
        }
      }
    }
    
    if (updates.length > 0) {
      for (const update of updates) {
        // Update if exists, insert if not using upsert
        const { error } = await supabase
          .from('currency_rates')
          .upsert(update, {
            onConflict: 'base_currency,quote_currency',
            ignoreDuplicates: false
          });
          
        if (error) {
          console.error("Error updating rate:", error);
        }
      }
    }
    
    return { success: true, updatedCount: updates.length };
  } catch (error) {
    console.error("Database update error:", error);
    return { success: false, error: error.message };
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Check if this is an automated request or a user request
    const url = new URL(req.url);
    const isAutomated = url.searchParams.get('automated') === 'true';
    
    // Fetch rates from various sources
    const rates = await fetchCurrencyRates();
    
    // If this is an automated request (from cron job), update database
    if (isAutomated) {
      const updateResult = await updateRatesInDatabase(rates);
      return new Response(
        JSON.stringify(updateResult),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Otherwise just return the rates
    return new Response(
      JSON.stringify({ rates }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error in currency rates function:", error);
    
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
