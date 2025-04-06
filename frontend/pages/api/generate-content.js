export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic, audience, contentType } = req.body;

    if (!topic || !audience || !contentType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use the environment variable for backend URL
    const apiUrl = `${process.env.BACKEND_API_URL || 'http://backend:8000'}/api/content/generate`;
    
    console.log(`Making request to backend API: ${apiUrl}`);
    
    // Call the backend API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        audience
      }),
    });

    // Handle API response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status}`, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    // Parse the response data
    const data = await response.json();
    console.log('Received data from backend:', data);

    // Format it for the frontend
    return res.status(200).json({
      content: data.explanation || 'No content generated',
      imagePrompts: data.image_prompts || []
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}