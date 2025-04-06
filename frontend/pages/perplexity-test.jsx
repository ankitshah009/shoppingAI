import { useState } from 'react';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';

export default function PerplexityTest() {
  const [query, setQuery] = useState('');
  const [recency, setRecency] = useState('month');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/perplexity-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, recency }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }

      setResult(data);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-primary-600">
          Perplexity Search Test
        </h1>
        
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search Query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={recency}
              onChange={(e) => setRecency(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={loading}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="btn px-6 py-2 md:h-[42px] whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : 'Search'}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}

        {result && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">
              {result.mock ? 'MOCK RESULT' : 'LIVE RESULT'}
            </div>
            
            <div className="bg-white border border-gray-100 rounded p-4 prose prose-sm md:prose-base max-w-none">
              <ReactMarkdown>
                {result.answer || result.error || 'No results found'}
              </ReactMarkdown>
            </div>
            
            {result.sources && result.sources.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold mb-2">Sources</h3>
                <ul className="space-y-1 list-disc pl-5">
                  {result.sources.map((source, index) => (
                    <li key={index}>
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {source.title || source.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 