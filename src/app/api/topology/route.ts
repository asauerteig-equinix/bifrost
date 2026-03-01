import { NextRequest, NextResponse } from 'next/server';
import { calculateRoute } from '@/lib/routeCalculator';
import type { RouteResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { start, end, redundancy } = await request.json();

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: 'Start and end system IDs are required' } as RouteResponse,
        { status: 400 }
      );
    }

    const includeRedundancy = redundancy === 'redundant';
    const result = await calculateRoute(start, end, includeRedundancy);

    return NextResponse.json({
      success: true,
      primaryRoute: result.primaryRoute,
      redundantRoute: result.redundantRoute,
    } as RouteResponse);

  } catch (error: any) {
    console.error('Route calculation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate route' } as RouteResponse,
      { status: 500 }
    );
  }
}
