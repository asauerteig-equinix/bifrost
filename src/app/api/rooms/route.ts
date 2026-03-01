import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        building: true,
      }
    });

    return NextResponse.json({ success: true, rooms });
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
    const { systemId, buildingId, floor, roomName, type } = body;

    const room = await prisma.room.create({
      data: {
        systemId,
        buildingId: parseInt(buildingId),
        floor,
        roomNumber: roomName,
        type,
      },
    });

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
