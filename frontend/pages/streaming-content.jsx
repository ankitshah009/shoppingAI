import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import StreamingContentGenerator from '../components/StreamingContentGenerator';

export default function DealsFeedPage() {
  return (
    <Layout>
      <Head>
        <title>Real-time Deals Feed | ShoppingAI</title>
        <meta name="description" content="Get real-time updates on the best deals and product availability" />
      </Head>
      
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: '#5e35b1' }}>Real-time Deals Feed</h1>
            <p className="text-gray-600">
              Watch as AI monitors and alerts you to the best deals, price drops, and availability updates in real-time.
            </p>
          </div>
          
          <StreamingContentGenerator />
        </div>
      </div>
    </Layout>
  );
}
