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
    const { ibxCode, name, city, country } = body;

    const building = await prisma.building.create({
      data: {
        ibxCode,
        name,
        city: city || '',
        country: country || '',
      },
    });

    return NextResponse.json({ success: true, building });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
