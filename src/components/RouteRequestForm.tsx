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
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Route Calculator</h2>
      
      <div>
        <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
          Start System ID
        </label>
        <input
          id="start"
          type="text"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          placeholder="FR2:01:50900"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
          End System ID
        </label>
        <input
          id="end"
          type="text"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          placeholder="MU1:UG:NSE-01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="redundancy" className="block text-sm font-medium text-gray-700 mb-1">
          Redundancy
        </label>
        <select
          id="redundancy"
          value={redundancy}
          onChange={(e) => setRedundancy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="single">Single Path</option>
          <option value="redundant">Redundant Path</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Calculating...' : 'Calculate Route'}
      </button>
    </form>
  );
}
