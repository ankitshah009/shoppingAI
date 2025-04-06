import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ProductFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('mid-range');
  const [productCategory, setProductCategory] = useState('electronics');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [generatedImages, setGeneratedImages] = useState({});
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setContent(null);
    setGeneratedImages({});
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: searchQuery,
          audience: priceRange,
          contentType: productCategory,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to find products');
      }
      
      const data = await response.json();
      setContent(data);
      
      // Auto-generate images if there are prompts
      if (data.imagePrompts && data.imagePrompts.length > 0) {
        // Generate the first image immediately
        console.log('Auto-generating first image...');
        handleGenerateImage(data.imagePrompts[0]);
      }
    } catch (err) {
      console.error('Error in product search:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async (prompt) => {
    setGeneratingImage(true);
    setImageError(null);
    setLoadingImage(true);
    
    try {
      console.log(`Generating image for prompt: ${prompt}`);
      
      // Add timestamp to avoid cache issues
      const timestamp = new Date().getTime();
      console.log(`Adding timestamp: ${timestamp}`);
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          timestamp
        }),
      });
      
      // Check if the response is OK first
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from API:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      // Parse response JSON - clone response to avoid "body already read" error
      const data = await response.clone().json().catch(e => {
        console.error('JSON parsing error:', e);
        throw new Error('Failed to parse API response');
      });
      
      console.log('Received image generation response:', data);
      
      if (data && data.success) {
        console.log(`Successfully generated image with URL: ${data.image_url}`);
        
        // Verify we have a valid image URL
        if (!data.image_url) {
          throw new Error('No image URL returned from API');
        }
        
        // Log all the image URLs for debugging
        console.log('Proxied URL:', data.image_url);
        console.log('Original URL:', data.original_url);
        
        // Add a random query parameter to force image reload
        const cacheBuster = `?cache=${Math.random().toString(36).substring(7)}`;
        
        // Immediately update state with the image URL
        setGeneratedImages(prevState => ({
          ...prevState,
          [prompt]: `${data.image_url}${cacheBuster}`
        }));
      } else {
        const errorMsg = data?.error || 'Failed to generate image';
        console.error('API reported failure:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error in image generation:', err);
      setImageError(err.message || 'Failed to generate image');
    } finally {
      setGeneratingImage(false);
      setLoadingImage(false);
    }
  };

  // Add this useEffect to automatically generate all images when content changes
  useEffect(() => {
    const generateAllImages = async () => {
      if (content && content.imagePrompts && content.imagePrompts.length > 0) {
        console.log('Auto-generating all images...');
        // Generate all images in sequence
        for (const prompt of content.imagePrompts) {
          if (!generatedImages[prompt]) {
            console.log(`Auto-generating image for prompt: ${prompt}`);
            await handleGenerateImage(prompt);
          }
        }
      }
    };
    
    generateAllImages();
  }, [content]);

  return (
    <Layout>
      <Head>
        <title>Product Finder | ShoppingAI</title>
        <meta name="description" content="Find perfect products that match your needs and budget" />
      </Head>
      
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#5e35b1' }}>Smart Product Finder</h1>
            <p className="text-gray-600">Find the perfect products that match your needs, preferences, and budget.</p>
          </div>
          
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="searchQuery" className="form-label">What are you looking for?</label>
                <input
                  id="searchQuery"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Noise-cancelling headphones, Eco-friendly coffee maker, Running shoes for flat feet"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="priceRange" className="form-label">Price Range</label>
                  <select
                    id="priceRange"
                    className="form-select"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="budget">Budget-friendly</option>
                    <option value="mid-range">Mid-range</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                    <option value="any">Any price range</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="productCategory" className="form-label">Product Category</label>
                  <select
                    id="productCategory"
                    className="form-select"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                  >
                    <option value="electronics">Electronics</option>
                    <option value="home">Home & Kitchen</option>
                    <option value="fashion">Fashion</option>
                    <option value="beauty">Beauty & Personal Care</option>
                    <option value="sports">Sports & Outdoors</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn w-full mt-4"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding Products...
                  </span>
                ) : 'Find Products'}
              </button>
            </form>
          </div>
          
          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center">
              <p>{error}</p>
            </div>
          )}
          
          {content && (
            <div className="result-container mt-8">
              <h3 className="text-xl font-bold mb-4 text-primary-600">Recommended Products</h3>
              <div className="prose prose-slate max-w-none bg-white border border-gray-200 rounded-lg p-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content.content}
                </ReactMarkdown>
              </div>
              
              {content.imagePrompts && content.imagePrompts.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Product Images</h4>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 mb-4 rounded-lg">
                    <p className="text-sm text-yellow-700">Debug info - Images to generate: {content.imagePrompts.length}, Images generated: {Object.keys(generatedImages).length}</p>
                  </div>
                  <ul className="list-disc pl-5 space-y-6">
                    {content.imagePrompts.map((prompt, index) => (
                      <li key={index} className="text-gray-700">
                        <div className="flex flex-col space-y-2">
                          <p className="font-medium">Prompt #{index + 1}</p>
                          {generatedImages[prompt] ? (
                            <div className="mt-2">
                              <div className="relative w-full max-w-screen-lg">
                                <img
                                  src={`${generatedImages[prompt]}?cache=${Date.now()}`}
                                  alt={`Generated image for: ${prompt}`}
                                  width={600}
                                  height={400}
                                  loading="lazy"
                                  className="max-w-full h-auto rounded"
                                  onError={(e) => {
                                    console.error('Image failed to load, retrying...');
                                    // Add a small delay before trying again
                                    setTimeout(() => {
                                      // Change the src to trigger a reload with a new cache buster
                                      e.target.src = `${generatedImages[prompt].split('?')[0]}?cache=${Date.now()}`;
                                    }, 1000);
                                  }}
                                />
                                <button
                                  className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                                  onClick={() => handleGenerateImage(prompt)}
                                >
                                  Regenerate
                                </button>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{prompt}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col space-y-2">
                              <p className="text-sm">{prompt}</p>
                              <button
                                className="self-start px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                                onClick={() => handleGenerateImage(prompt)}
                                disabled={generatingImage}
                              >
                                {generatingImage ? 'Generating...' : 'Generate Image'}
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {imageError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600">
                      <p>{imageError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}