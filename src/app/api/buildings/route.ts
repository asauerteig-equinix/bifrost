import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        rooms: true,
      }
    });

    return NextResponse.json({ success: true, buildings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
