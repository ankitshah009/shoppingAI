import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, recency = 'month' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    console.log(`Searching Perplexity with query: "${query}", recency: ${recency}`);
    
    // Get the MCP URL from environment variable with fallback to localhost
    const mcpUrlFromEnv = process.env.PERPLEXITY_MCP_URL;
    
    // Define multiple potential URLs to try in case the primary one fails
    const urlsToTry = [
      mcpUrlFromEnv,
      'http://shopai-perplexity:3500',
      'http://perplexity:3500',
      'http://localhost:3500'
    ].filter(Boolean); // Remove any undefined or empty values
    
    console.log(`Will try these Perplexity MCP URLs in order:`, urlsToTry);

    // Try each URL sequentially until one works
    let lastError = null;
    
    for (const mcpUrl of urlsToTry) {
      try {
        console.log(`Attempting with URL: ${mcpUrl}`);
        
        // First try the tool endpoint
        try {
          console.log(`Trying tool endpoint: ${mcpUrl}/api/tool`);
          const toolResponse = await fetch(`${mcpUrl}/api/tool`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              toolName: 'perplexity_search_web',
              args: { query, recency }
            }),
            timeout: 15000 // 15 second timeout
          });
          
          if (toolResponse.ok) {
            const data = await toolResponse.json();
            console.log(`Success with ${mcpUrl}/api/tool`);
            return res.status(200).json(data);
          } else {
            console.error(`Tool endpoint error with ${mcpUrl}: ${toolResponse.status}`);
            // Try prompt endpoint with this URL
          }
        } catch (toolError) {
          console.error(`Error with tool endpoint at ${mcpUrl}:`, toolError.message);
          // Try prompt endpoint with this URL
        }
        
        // If tool endpoint failed, try the prompt endpoint
        console.log(`Trying prompt endpoint: ${mcpUrl}/api/prompt`);
        const promptResponse = await fetch(`${mcpUrl}/api/prompt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promptName: 'perplexity_search_web',
            args: { query, recency }
          }),
          timeout: 15000 // 15 second timeout
        });
        
        if (promptResponse.ok) {
          const data = await promptResponse.json();
          console.log(`Success with ${mcpUrl}/api/prompt`);
          return res.status(200).json(data);
        } else {
          throw new Error(`Prompt endpoint responded with status: ${promptResponse.status}`);
        }
      } catch (urlError) {
        console.error(`Failed with URL ${mcpUrl}:`, urlError.message);
        lastError = urlError;
        // Continue to the next URL
      }
    }
    
    // If we reach here, none of the URLs worked
    throw new Error(`All connection attempts failed. Last error: ${lastError?.message}`);
  } catch (err) {
    console.error('Error searching with Perplexity:', err);
    
    // Create a mock response with helpful troubleshooting information
    return res.status(500).json({ 
      error: `Failed to search with Perplexity: ${err.message}`,
      mock: true,
      answer: `# Connection Error

Unable to get search results for your query. Error: ${err.message}

## Troubleshooting Steps:

1. Make sure the Perplexity server is running
   - Check if container is running with \`docker ps\`
   - If not, restart it with \`docker-compose up -d perplexity\`

2. Check Docker network connectivity
   - Tried these URLs: ${JSON.stringify(process.env.PERPLEXITY_MCP_URL || ['None configured'])}
   - Try restarting all containers: \`docker-compose down && docker-compose up -d\`

3. Check container names
   - Run \`docker ps\` to verify the actual container names
   - Update docker-compose.yml if container names don't match URLs`
    });
  }
} 