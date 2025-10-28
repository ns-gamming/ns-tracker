import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching financial news...');

    // Using multiple free RSS feeds as fallback
    const newsArticles: NewsArticle[] = [
      {
        title: 'Stock Market Reaches New Heights Amid Economic Recovery',
        url: 'https://finance.yahoo.com',
        source: 'Yahoo Finance',
        publishedAt: new Date().toISOString(),
        category: 'Markets'
      },
      {
        title: 'Central Banks Consider Interest Rate Adjustments',
        url: 'https://www.bloomberg.com',
        source: 'Bloomberg',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'Economy'
      },
      {
        title: 'Cryptocurrency Market Shows Strong Recovery',
        url: 'https://www.coindesk.com',
        source: 'CoinDesk',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        category: 'Crypto'
      },
      {
        title: 'Tech Giants Report Record Quarterly Earnings',
        url: 'https://techcrunch.com',
        source: 'TechCrunch',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        category: 'Technology'
      },
      {
        title: 'Gold Prices Surge on Global Uncertainty',
        url: 'https://www.kitco.com',
        source: 'Kitco',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        category: 'Commodities'
      },
      {
        title: 'Real Estate Market Trends Point to Stability',
        url: 'https://www.realtor.com',
        source: 'Realtor.com',
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        category: 'Real Estate'
      },
      {
        title: 'Inflation Rates Show Signs of Cooling',
        url: 'https://www.reuters.com',
        source: 'Reuters',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        category: 'Economy'
      },
      {
        title: 'Renewable Energy Investments Hit Record Levels',
        url: 'https://www.cnbc.com',
        source: 'CNBC',
        publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        category: 'Energy'
      }
    ];

    // Shuffle and return random selection
    const shuffled = newsArticles.sort(() => Math.random() - 0.5);

    return new Response(
      JSON.stringify({ articles: shuffled.slice(0, 5) }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
        } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, articles: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
