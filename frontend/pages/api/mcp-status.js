export default async function handler(req, res) {
  // Get the MCP URL from environment variable
  const mcpUrl = process.env.PERPLEXITY_MCP_URL || 'http://perplexity-mcp:3500';
  
  console.log(`Checking Perplexity MCP server status at: ${mcpUrl}`);
  
  try {
    // Try both the tool and prompt endpoints to see if either works
    let success = false;
    let error = null;
    
    try {
      // First try sending a ping to the tool endpoint
      const toolResponse = await fetch(`${mcpUrl}/api/tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: 'perplexity_search_web',
          args: { query: 'test', recency: 'day' }
        }),
        timeout: 5000
      });
      
      if (toolResponse.ok) {
        success = true;
      } else {
        error = `Tool endpoint responded with status: ${toolResponse.status}`;
      }
    } catch (toolError) {
      error = `Tool endpoint error: ${toolError.message}`;
      // Continue to try prompt endpoint
    }
    
    // If tool endpoint failed, try the prompt endpoint
    if (!success) {
      try {
        const promptResponse = await fetch(`${mcpUrl}/api/prompt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promptName: 'perplexity_search_web',
            args: { query: 'test', recency: 'day' }
          }),
          timeout: 5000
        });
        
        if (promptResponse.ok) {
          success = true;
          error = null;
        } else {
          error = `Prompt endpoint responded with status: ${promptResponse.status}`;
        }
      } catch (promptError) {
        error = error ? `${error}; Prompt endpoint error: ${promptError.message}` : `Prompt endpoint error: ${promptError.message}`;
      }
    }
    
    return res.status(200).json({
      success,
      url: mcpUrl,
      error: error || null
    });
  } catch (err) {
    console.error('Error checking MCP server status:', err);
    return res.status(500).json({
      success: false,
      url: mcpUrl,
      error: err.message || 'Unknown error'
    });
  }
} 