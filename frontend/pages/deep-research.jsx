import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ProductComparison() {
  const [products, setProducts] = useState('');
  const [details, setDetails] = useState('');
  const [purchaseIntent, setPurchaseIntent] = useState('research');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: products,
          details,
          level: purchaseIntent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to compare products');
      }
      
      const data = await response.json();
      setContent(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Product Comparison | ShoppingAI</title>
        <meta name="description" content="Compare products and get detailed analysis to make better buying decisions" />
      </Head>
      
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#5e35b1' }}>Product Comparison Tool</h1>
            <p className="text-gray-600">Compare products with detailed analysis, specs, prices, and reviews to make informed decisions.</p>
          </div>
          
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="products" className="form-label">Products to Compare</label>
                <input
                  id="products"
                  type="text"
                  className="form-input"
                  placeholder="e.g. iPhone 13 vs Samsung Galaxy S22, Sony WH-1000XM4 vs Bose 700, Dyson V11 vs Shark Vertex"
                  value={products}
                  onChange={(e) => setProducts(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="details" className="form-label">Specific Features to Compare (optional)</label>
                <textarea
                  id="details"
                  className="form-textarea"
                  placeholder="Specific features you're interested in comparing? (e.g. battery life, camera quality, durability)"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="purchaseIntent" className="form-label">Purchase Intent</label>
                <select
                  id="purchaseIntent"
                  className="form-select"
                  value={purchaseIntent}
                  onChange={(e) => setPurchaseIntent(e.target.value)}
                >
                  <option value="research">Just Researching</option>
                  <option value="planning">Planning to Purchase Soon</option>
                  <option value="ready">Ready to Buy Now</option>
                  <option value="expert">Need Expert Analysis</option>
                </select>
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
                    Comparing Products...
                  </span>
                ) : 'Compare Products'}
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
              <h3 className="text-xl font-bold mb-4 text-primary-600">Comparison Results</h3>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content.content}
                </ReactMarkdown>
              </div>
              
              {content.references && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold mb-4 text-primary-600">Sources & Reviews</h4>
                  <ul className="space-y-2 text-gray-700">
                    {content.references.map((reference, index) => (
                      <li key={index} className="pl-4 border-l-2 border-primary-200">
                        {reference}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
