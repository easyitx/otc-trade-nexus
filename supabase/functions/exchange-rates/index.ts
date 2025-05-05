
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
async function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  return null;
}

// Parse number from string, handling Russian decimal format
function parseRussianNumber(str: string): number {
  const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned);
}

// Fetch CBR exchange rate
async function fetchCBR(): Promise<number | null> {
  try {
    const response = await fetch('https://www.cbr.ru/');
    if (!response.ok) return null;
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // The selector might need adjustment based on the actual CBR website structure
    const usdElement = doc?.querySelector('div.indicator_rate:contains("USD")');
    if (!usdElement) return null;
    
    const valueElement = usdElement.querySelector('.mono-num');
    if (!valueElement) return null;
    
    const rateText = valueElement.textContent.trim();
    return parseRussianNumber(rateText);
  } catch (error) {
    console.error("Error fetching CBR rate:", error);
    return null;
  }
}

// Fetch Profinance exchange rate
async function fetchProfinance(): Promise<number | null> {
  try {
    const response = await fetch('https://www.profinance.ru/charts/usdrub/lc11');
    if (!response.ok) return null;
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract the rate from the page - selector might need adjustment
    const rateElement = doc?.querySelector('.quotelink');
    if (!rateElement) return null;
    
    const rateText = rateElement.textContent.trim();
    return parseRussianNumber(rateText);
  } catch (error) {
    console.error("Error fetching Profinance rate:", error);
    return null;
  }
}

// Fetch Investing.com exchange rate
async function fetchInvesting(): Promise<number | null> {
  try {
    // Note: Investing.com might require additional headers to prevent blocking
    const response = await fetch('https://www.investing.com/currencies/usd-rub', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract the rate from the page - selector might need adjustment
    const rateElement = doc?.querySelector('.text-2xl');
    if (!rateElement) return null;
    
    const rateText = rateElement.textContent.trim();
    return parseRussianNumber(rateText);
  } catch (error) {
    console.error("Error fetching Investing rate:", error);
    return null;
  }
}

// Fetch XE exchange rate (this might require an API key)
async function fetchXE(): Promise<number | null> {
  try {
    // XE might not allow direct scraping, typically requires an API key
    const response = await fetch('https://www.xe.com/currencycharts/?from=USD&to=RUB');
    if (!response.ok) return null;
    
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract the rate from the page - selector might need adjustment
    const rateElement = doc?.querySelector('.heading__Details-sc-1dv2hjc-1');
    if (!rateElement) return null;
    
    const rateText = rateElement.textContent.trim();
    return parseRussianNumber(rateText);
  } catch (error) {
    console.error("Error fetching XE rate:", error);
    return null;
  }
}

// Fallback to a mock API for testing/demo purposes
async function fetchMockRates() {
  return {
    cbr: 81.49,
    profinance: 80.66,
    investing: 81.21,
    xe: 82.78
  };
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // For now, use mock data as scraping these websites might be unreliable
    // In a production environment, you might want to use official APIs
    const rates = await fetchMockRates();
    
    // In a real implementation, you would call the actual fetching functions:
    // const cbrRate = await fetchCBR();
    // const profinanceRate = await fetchProfinance();
    // const investingRate = await fetchInvesting();
    // const xeRate = await fetchXE();
    
    // const rates = {
    //   cbr: cbrRate,
    //   profinance: profinanceRate,
    //   investing: investingRate,
    //   xe: xeRate
    // };
    
    return new Response(JSON.stringify(rates), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error("Error in exchange rates function:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
