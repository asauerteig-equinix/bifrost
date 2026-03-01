'use client';

import { Route } from '@/types';

interface Props {
  primaryRoute?: Route;
  redundantRoute?: Route | null;
}

export default function RouteVisualizer({ primaryRoute, redundantRoute }: Props) {
  if (!primaryRoute && !redundantRoute) return null;

  const allSystemIds = new Set<string>();
  const connections: { from: string; to: string; type: 'primary' | 'redundant' }[] = [];

  if (primaryRoute) {
    primaryRoute.path.forEach(step => {
      allSystemIds.add(step.systemId);
    });
    for (let index = 0; index < primaryRoute.path.length - 1; index++) {
      connections.push({
        from: primaryRoute.path[index].systemId,
        to: primaryRoute.path[index + 1].systemId,
        type: 'primary',
      });
    }
  }

  if (redundantRoute) {
    redundantRoute.path.forEach(step => {
      allSystemIds.add(step.systemId);
    });
    for (let index = 0; index < redundantRoute.path.length - 1; index++) {
      connections.push({
        from: redundantRoute.path[index].systemId,
        to: redundantRoute.path[index + 1].systemId,
        type: 'redundant',
      });
    }
  }

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Route Visualization</h3>
      
      <div className="space-y-3">
        {Array.from(allSystemIds).map((systemId, idx) => (
          <div key={systemId} className="flex items-center">
            <div className="w-48 px-3 py-2 bg-blue-100 border border-blue-300 rounded text-sm font-medium">
              {systemId}
            </div>
            {idx < allSystemIds.size - 1 && (
              <div className="flex-1 ml-2 flex flex-col gap-1">
                {connections
                  .filter(c => c.from === systemId)
                  .map((conn, i) => (
                    <div
                      key={i}
                      className={`h-1 ${
                        conn.type === 'primary' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: '100px' }}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-blue-500" />
          <span>Primary Route</span>
        </div>
        {redundantRoute && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-green-500" />
            <span>Redundant Route</span>
          </div>
        )}
      </div>
    </div>
  );
}
