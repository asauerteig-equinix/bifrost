'use client';

import { useState } from 'react';
import RouteRequestForm from '@/components/RouteRequestForm';
import RouteResults from '@/components/RouteResults';
import RouteVisualizer from '@/components/RouteVisualizer';
import type { RouteResponse } from '@/types';

export default function HomePage() {
  const [result, setResult] = useState<RouteResponse | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Network Route Calculator
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Calculate optimal network routes between data center locations. 
            Enter start and end system IDs to find the shortest path through your infrastructure.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto space-y-6">
          <RouteRequestForm onResult={setResult} />

          {result && (
            <>
              <RouteResults result={result} />
              {result.success && (
                <RouteVisualizer
                  primaryRoute={result.primaryRoute}
                  redundantRoute={result.redundantRoute}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
