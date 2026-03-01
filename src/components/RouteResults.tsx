'use client';

import { RouteResponse, Route } from '@/types';

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

  const renderRoute = (route: Route, title: string) => {

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="space-y-2">
          {route.path.map((step, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-3 py-1">
              <div className="font-medium">{step.systemId}</div>
              <div className="text-sm text-gray-600">
                Type: {step.roomType}
                {step.rackInfo && ` • ${step.rackInfo}`}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 font-semibold">
          Total Distance: {route.totalLength}m
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
