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

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('admin_session');
    if (session?.value !== 'authenticated') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fromRoomId, toRoomId, lengthMeters, rackInfo } = body;

    const connection = await prisma.connection.create({
      data: {
        fromRoomId: parseInt(fromRoomId),
        toRoomId: parseInt(toRoomId),
        lengthMeters: parseFloat(lengthMeters),
        rackInfo: rackInfo || null,
      },
    });

    return NextResponse.json({ success: true, connection });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
