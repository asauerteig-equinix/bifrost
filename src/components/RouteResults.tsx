'use client';

import { RouteResponse, RouteSegment } from '@/types';

interface Props {
  result: RouteResponse;
}

export default function RouteResults({ result }: Props) {
  if (!result) return null;

  if (!result.success) {
    return (
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  const renderRoute = (segments: RouteSegment[], title: string) => {
    const totalDistance = segments.reduce((sum, seg) => sum + seg.lengthMeters, 0);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="space-y-2">
          {segments.map((segment, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-3 py-1">
              <div className="font-medium">{segment.fromSystemId} → {segment.toSystemId}</div>
              <div className="text-sm text-gray-600">
                Distance: {segment.lengthMeters}m
                {segment.rackInfo && ` • ${segment.rackInfo}`}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 font-semibold">
          Total Distance: {totalDistance}m
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {result.primaryRoute && renderRoute(result.primaryRoute, 'Primary Route')}
      {result.redundantRoute && renderRoute(result.redundantRoute, 'Redundant Route')}
    </div>
  );
}
