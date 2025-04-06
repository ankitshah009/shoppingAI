import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const StreamingContentGenerator = () => {
  const [productCategory, setProductCategory] = useState('electronics');
  const [priceRange, setPriceRange] = useState('any');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState('');
  const [imagePrompts, setImagePrompts] = useState([]);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (contentRef.current && streaming) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, streaming]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous content and errors
    setContent('');
    setImagePrompts([]);
    setError(null);
    setLoading(true);

    try {
      // Start the streaming process
      setStreaming(true);
      
      // Use our Next.js API route to avoid CORS issues
      const apiUrl = '/api/generate-content-stream';
      
      console.log('Starting streaming request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: productCategory,
          audience: priceRange
        })
      });
      
      if (!response.ok || !response.body) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      console.log('Response received, setting up reader');
      
      // Set up a reader to handle the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Process the stream
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream complete');
          break;
        }
        
        // Decode the chunk
        const chunk = decoder.decode(value);
        buffer += chunk;
        
        // Process each complete SSE message
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // Keep the last incomplete chunk in the buffer
        
        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const data = JSON.parse(message.substring(6));
              
              if (data.error) {
                setError(data.error);
                setStreaming(false);
                setLoading(false);
                return;
              }
              
              if (data.finished) {
                // We've received the last chunk
                if (data.image_prompts) {
                  setImagePrompts(data.image_prompts);
                }
                setStreaming(false);
                setLoading(false);
              } else {
                // Append the new chunk to the content
                setContent(prev => prev + data.chunk);
              }
            } catch (err) {
              console.error('Error parsing SSE data:', err, message.substring(6));
            }
          }
        }
      }
      
    } catch (err) {
      console.error('Error in streaming request:', err);
      setError(err.message || 'Connection error. Please try again.');
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setStreaming(false);
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="productCategory" className="form-label">Product Category</label>
            <select
              id="productCategory"
              className="form-select"
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              disabled={streaming || loading}
            >
              <option value="electronics">Electronics</option>
              <option value="home">Home & Kitchen</option>
              <option value="fashion">Fashion & Apparel</option>
              <option value="beauty">Beauty & Personal Care</option>
              <option value="sports">Sports & Outdoors</option>
              <option value="toys">Toys & Games</option>
              <option value="grocery">Grocery & Gourmet</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="priceRange" className="form-label">Price Range</label>
            <select
              id="priceRange"
              className="form-select"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              disabled={streaming || loading}
            >
              <option value="budget">Under $50</option>
              <option value="mid-range">$50 - $200</option>
              <option value="premium">$200 - $500</option>
              <option value="luxury">$500+</option>
              <option value="any">Any price range</option>
              <option value="discounts">Only discounted items</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button 
              type="submit" 
              className="btn w-full mt-4"
              disabled={streaming || loading}
            >
              {loading && !streaming ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : 'Find Latest Deals'}
            </button>
            
            {streaming && (
              <button 
                type="button" 
                className="btn btn-secondary w-full mt-4"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {error && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
          <p>{error}</p>
        </div>
      )}
      
      {(content || streaming) && (
        <div className="result-container">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-primary-600">
              {streaming ? 'Finding Latest Deals...' : 'Latest Deal Updates'}
            </h3>
            {streaming && (
              <div className="flex items-center text-gray-500">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Searching for deals...</span>
              </div>
            )}
          </div>
          
          <div 
            ref={contentRef}
            className="prose prose-slate max-w-none bg-white border border-gray-200 rounded-lg p-6 max-h-[500px] overflow-y-auto"
          >
            <ReactMarkdown plugins={[remarkGfm]}>{content || 'Waiting for deals...'}</ReactMarkdown>
          </div>
          
          {imagePrompts.length > 0 && (
            <div className="mt-6">
              <h4 className="font-bold text-lg mb-2">Product Images:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {imagePrompts.map((prompt, index) => (
                  <li key={index} className="text-gray-700">{prompt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamingContentGenerator;
