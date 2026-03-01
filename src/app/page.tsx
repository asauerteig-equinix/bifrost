'use client';

import { useState } from 'react';
import RouteRequestForm from '@/components/RouteRequestForm';
import RouteResults from '@/components/RouteResults';
import RouteVisualizer from '@/components/RouteVisualizer';
import type { RouteResponse } from '@/types';

export default function HomePage() {
  const [result, setResult] = useState<RouteResponse | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to BIFROST</h2>
        <p className="text-gray-600">
          Calculate the optimal network routes between data center locations. 
          Enter a start and end system ID to find the shortest path through your infrastructure.
        </p>
      </div>

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
  );
}
