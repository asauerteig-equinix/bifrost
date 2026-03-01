'use client';

import { useState } from 'react';
import { RouteResponse } from '@/types';

interface Props {
  onResult: (result: RouteResponse) => void;
}

export default function RouteRequestForm({ onResult }: Props) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [redundancy, setRedundancy] = useState('single');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/topology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end, redundancy }),
      });

      const result: RouteResponse = await response.json();
      onResult(result);
    } catch (error) {
      onResult({
        success: false,
        error: 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Route Calculator</h2>
          <p className="text-slate-600 text-sm">Find the optimal path between locations</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="start" className="label">
              Start System ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                id="start"
                type="text"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                placeholder="FR2:01:50900"
                className="input-field pl-10"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Format: IBX:FLOOR:ROOM</p>
          </div>

          <div>
            <label htmlFor="end" className="label">
              End System ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <input
                id="end"
                type="text"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                placeholder="MU1:UG:NSE-01"
                className="input-field pl-10"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Format: IBX:FLOOR:ROOM</p>
          </div>
        </div>

        <div>
          <label htmlFor="redundancy" className="label">
            Path Redundancy
          </label>
          <select
            id="redundancy"
            value={redundancy}
            onChange={(e) => setRedundancy(e.target.value)}
            className="input-field"
          >
            <option value="single">Single Path (Fastest Route)</option>
            <option value="redundant">Redundant Path (Backup Route)</option>
          </select>
          <p className="text-xs text-slate-500 mt-1">
            Redundant paths avoid shared connections for better resilience
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Calculating Route...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Calculate Route</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
