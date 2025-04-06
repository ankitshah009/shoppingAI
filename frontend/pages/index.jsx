import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>ShoppingAI - Smart Shopping Assistant</title>
        <meta name="description" content="AI-powered shopping assistant to find products, compare prices, and get personalized recommendations" />
      </Head>
      
      <div className="container">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#5e35b1' }}>
            <span className="text-gray-800">Shopping</span>AI
          </h1>
          <h2 className="text-2xl mb-6 text-gray-700">AI-Powered Shopping Assistant</h2>
          <p className="text-xl mb-10 mx-auto max-w-3xl text-gray-600">
            Find the perfect products, compare prices, and get personalized recommendations
            with the power of artificial intelligence.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/content" className="btn">
              Start Shopping
            </Link>
            <Link href="/deep-research" className="btn-outline">
              Product Research
            </Link>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="rounded-full p-3 bg-primary-50 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#5e35b1" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: '#5e35b1' }}>Product Finder</h3>
            </div>
            <p className="mb-6 text-gray-600">
              Discover products tailored to your preferences, budget, and needs.
              Perfect for finding exactly what you're looking for with minimal effort.
            </p>
            <Link href="/content" className="btn">
              Find Products
            </Link>
          </div>
          
          <div className="card">
            <div className="flex items-center mb-4">
              <div className="rounded-full p-3 bg-primary-50 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#5e35b1" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold" style={{ color: '#5e35b1' }}>Product Research</h3>
            </div>
            <p className="mb-6 text-gray-600">
              Get comprehensive product comparisons, reviews, price analysis, and feature breakdowns
              to make informed shopping decisions.
            </p>
            <Link href="/deep-research" className="btn">
              Compare Products
            </Link>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="card my-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-8 text-center">How It Works</h3>
          <ol className="space-y-6 max-w-2xl mx-auto">
            <li className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary-600 text-white w-10 h-10 mr-4">
                1
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Enter your shopping needs</h4>
                <p className="text-gray-600">Describe what you're looking for, your budget, and preferences</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary-600 text-white w-10 h-10 mr-4">
                2
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">AI finds products for you</h4>
                <p className="text-gray-600">Our advanced AI analyzes products and recommends the best options for you</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center rounded-full bg-primary-600 text-white w-10 h-10 mr-4">
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Make informed decisions</h4>
                <p className="text-gray-600">Compare options, read reviews, and choose the perfect product with confidence</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}