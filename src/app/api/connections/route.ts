import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const connections = await prisma.connection.findMany({
      include: {
        fromRoom: true,
        toRoom: true,
      }
    });

    return NextResponse.json({ success: true, connections });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
