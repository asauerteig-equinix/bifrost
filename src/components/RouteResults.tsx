'use client';

import { RouteResponse, Route } from '@/types';

interface Props {
  result: RouteResponse;
}

export default function RouteResults({ result }: Props) {
  if (!result) return null;

  if (!result.success) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">Route Calculation Failed</h3>
            <p className="text-red-700">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderRoute = (route: Route, title: string, color: string) => {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="font-bold text-slate-900">{route.totalLength}m</span>
            <span className="text-slate-600 text-sm">total</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {route.path.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === route.path.length - 1;
            const isBackbone = step.roomType === 'BACKBONE';

            return (
              <div key={idx} className="relative">
                {/* Connection Line */}
                {!isLast && (
                  <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200" />
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    isFirst ? 'bg-green-100 text-green-700' :
                    isLast ? 'bg-red-100 text-red-700' :
                    isBackbone ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {isFirst ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : isLast ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isBackbone ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-900 text-lg mb-1">
                          {step.systemId}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`badge ${isBackbone ? 'badge-backbone' : 'badge-normal'}`}>
                            {step.roomType}
                          </span>
                          {isFirst && (
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              START
                            </span>
                          )}
                          {isLast && (
                            <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded">
                              END
                            </span>
                          )}
                        </div>
                        {step.rackInfo && (
                          <div className="mt-2 text-sm text-slate-600 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{step.rackInfo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {result.primaryRoute && renderRoute(result.primaryRoute, 'Primary Route', 'blue')}
      {result.redundantRoute && renderRoute(result.redundantRoute, 'Redundant Route', 'green')}
    </div>
  );
}
