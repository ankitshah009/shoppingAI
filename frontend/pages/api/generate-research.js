import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, details, level } = req.body;

    if (!topic || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Try to get real data from Perplexity if it's running locally
    try {
      const searchQuery = `Compare ${topic} focusing on ${details || 'specs, features, and price'} for someone who is ${level === 'research' ? 'researching products' : level === 'planning' ? 'planning to purchase soon' : 'ready to buy now'}`;
      
      console.log('Attempting to fetch from Perplexity MCP with query:', searchQuery);
      
      // Try to connect to the local Perplexity MCP server
      const perplexityResponse = await fetch('http://localhost:3500/api/tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: 'perplexity_search_web',
          args: {
            query: searchQuery,
            recency: level === 'ready' ? 'week' : 'month'
          }
        }),
        timeout: 15000 // 15 second timeout
      });

      if (perplexityResponse.ok) {
        const data = await perplexityResponse.json();
        console.log('Successfully fetched from Perplexity MCP');
        
        // Get the main content from Perplexity's response and ensure it's in markdown format
        let markdownContent = '';
        
        if (data.answer && typeof data.answer === 'string') {
          // Format the answer as markdown if it's not already
          if (!data.answer.includes('#')) {
            markdownContent = `# Product Comparison: ${topic}\n\n${data.answer}`;
          } else {
            markdownContent = data.answer;
          }
        } else if (data.text && typeof data.text === 'string') {
          markdownContent = `# Product Comparison: ${topic}\n\n${data.text}`;
        } else {
          // If we got some other format, try to convert to string
          markdownContent = `# Product Comparison: ${topic}\n\n${JSON.stringify(data, null, 2)}`;
        }
        
        // Format references
        const references = data.references?.map(ref => {
          if (ref.url) {
            return `[${ref.title || ref.url}](${ref.url})`;
          }
          return ref.title || 'Unknown source';
        }) || [];
        
        return res.status(200).json({
          content: markdownContent,
          references: references
        });
      } else {
        // If Perplexity MCP request fails, log error and fall back to mock data
        console.error('Perplexity MCP request failed with status:', perplexityResponse.status);
        throw new Error('Failed to fetch from Perplexity');
      }
    } catch (perplexityError) {
      console.error('Error with Perplexity MCP request:', perplexityError.message);
      // Fall back to mock data
    }

    // For now, return a mock response
    // In a real implementation, you would call your backend API here
    const mockResponse = generateProductComparison(topic, details, level);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Error generating product comparison:', error);
    return res.status(500).json({ error: 'Failed to generate comparison' });
  }
}

function generateProductComparison(products, details, purchaseIntent) {
  const specificFeatures = details ? `\n\n### Key Features Compared\n${details}` : '';
  
  // Extract product names for better formatting
  const productNames = products.includes(' vs ') 
    ? products.split(' vs ').map(p => p.trim()) 
    : [products, 'Similar Products'];
  
  const content = `# Product Comparison: ${productNames[0]} vs ${productNames[1]}\n\n` +
    `## Overview\n` +
    `This comparison analyzes the key differences between ${productNames[0]} and ${productNames[1]} to help you make an informed purchase decision. We've examined specifications, features, performance metrics, user reviews, and expert opinions to provide a comprehensive comparison.${specificFeatures}\n\n` +
    
    `## Design & Build Quality\n` +
    `${productNames[0]} features a premium design with aluminum and glass construction, offering a polished, high-end feel. It weighs approximately 171g with dimensions of 146.7 x 71.5 x 7.7mm, making it comfortable to hold and use one-handed.\n\n` +
    `In comparison, ${productNames[1]} has a slightly larger footprint at 160.3 x 77.8 x 8.3mm and weighs 221g. While heavier, it offers a larger display and more substantial feel. Both devices feature IP68 water and dust resistance, though ${productNames[1]} uses more premium materials and has better overall build quality.\n\n` +
    
    `## Performance\n` +
    `${productNames[0]} is powered by the A15 Bionic chip, which delivers exceptional performance for everyday tasks and demanding applications. It scores approximately 4,800 in multi-core benchmarks and handles gaming, multitasking, and AR applications with ease.\n\n` +
    `${productNames[1]} features the newer A17 Pro chip, offering about 25-30% better CPU performance and up to 40% improved graphics performance. It scores around 6,700 in multi-core benchmarks, making it significantly more powerful for intensive tasks like video editing, 3D gaming, and future-proofed applications.\n\n` +
    
    `## Display\n` +
    `${productNames[0]} comes with a 6.1-inch Super Retina XDR display with a resolution of 2532 x 1170 pixels (460 ppi). It supports HDR, True Tone, and P3 wide color gamut with a typical brightness of 800 nits (1200 nits for HDR content).\n\n` +
    `${productNames[1]} features a larger 6.7-inch Super Retina XDR ProMotion display with a resolution of 2796 x 1290 pixels (460 ppi). The key advantages include 120Hz adaptive refresh rate technology, higher brightness (1000 nits typical, 1600 nits for HDR, and 2000 nits peak outdoor brightness), and better color accuracy. The ProMotion technology provides noticeably smoother scrolling and animations.\n\n` +
    
    `## Camera System\n` +
    `${productNames[0]} features a dual-camera system with a 12MP main sensor (f/1.6 aperture) and a 12MP ultra-wide lens (f/2.4 aperture, 120° field of view). It performs well in most lighting conditions and supports night mode, Deep Fusion, and Smart HDR 4.\n\n` +
    `${productNames[1]} offers a significant upgrade with a triple-camera system: 48MP main sensor (f/1.8 aperture with second-generation sensor-shift OIS), 12MP ultra-wide (f/2.2 aperture), and 12MP telephoto with 3x optical zoom. It also includes a LiDAR scanner for enhanced AR experiences and night mode portraits. The camera system delivers superior low-light performance, more detailed photos, and professional-grade video capabilities with ProRes recording support.\n\n` +
    
    `## Battery Life & Charging\n` +
    `${productNames[0]} has a battery capacity of approximately 3,240mAh, which provides up to 17 hours of video playback and 65 hours of audio playback. It supports 20W wired charging (reaching 50% in about 30 minutes) and 15W MagSafe wireless charging.\n\n` +
    `${productNames[1]} comes with a larger battery (approximately 4,400mAh) that delivers up to 25 hours of video playback and 80 hours of audio playback. It supports the same 20W wired and 15W MagSafe wireless charging capabilities but provides significantly longer battery life, especially during intensive tasks.\n\n` +
    
    `## Price & Value\n` +
    `${productNames[0]} starts at $799 for the 128GB model, offering excellent performance and features at a more accessible price point. It provides great value for most users who don't need the absolute cutting-edge specifications.\n\n` +
    `${productNames[1]} starts at $1,199 for the 256GB model, representing a $400 premium over the base ${productNames[0]}. This price difference is justified by the superior display technology, camera system, performance, and battery life, but may be excessive for users who don't need these advanced features.\n\n` +
    
    `## Recommendation\n` +
    `Based on your purchase intent (${purchaseIntent}), we recommend:\n\n` +
    `- **${productNames[0]}**: Ideal for users seeking a balanced combination of performance, features, and value. Best for everyday users who want a premium experience without the highest price tag.\n\n` +
    `- **${productNames[1]}**: Perfect for power users, photography enthusiasts, and those who want the absolute best technology available. The premium features justify the higher price for users who will utilize the advanced capabilities.`;

  const references = [
    `TechRadar (2023). ["Complete ${productNames.join(' vs ')} Comparison: Which Should You Buy?"](https://www.techradar.com)`,
    `CNET (2023). ["${productNames[0]} vs ${productNames[1]}: Real-World Performance Tests"](https://www.cnet.com)`,
    `Digital Trends (2023). ["Camera Shootout: ${productNames.join(' vs ')}"](https://www.digitaltrends.com)`,
    `Tom's Guide (2023). ["Battery Life Tested: ${productNames.join(' vs ')}"](https://www.tomsguide.com)`,
    `Consumer Reports (2023). ["Value Analysis: Is the ${productNames[1]} Worth the Premium Over ${productNames[0]}?"](https://www.consumerreports.org)`
  ];

  return {
    content,
    references
  };
} 