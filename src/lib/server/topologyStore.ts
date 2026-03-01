import { prisma } from '../prisma';
import type { ParseResult } from './excelParser';

/**
 * Import parsed topology data into database
 */
export async function importTopology(data: ParseResult): Promise<{
  success: boolean;
  imported: { buildings: number; rooms: number; connections: number };
  errors: string[];
}> {
  const errors: string[] = [...data.errors];
  let buildingsCount = 0;
  let roomsCount = 0;
  let connectionsCount = 0;

  try {
    // Import buildings
    for (const building of data.buildings) {
      await prisma.building.upsert({
        where: { ibxCode: building.ibxCode },
        update: { name: building.name },
        create: building,
      });
      buildingsCount++;
    }

    // Import rooms
    for (const room of data.rooms) {
      // Find building
      const building = await prisma.building.findUnique({
        where: { ibxCode: room.ibxCode }
      });

      if (!building) {
        errors.push(`Building not found for room ${room.systemId}: ${room.ibxCode}`);
        continue;
      }

      await prisma.room.upsert({
        where: { systemId: room.systemId },
        update: {
          floor: room.floor,
          roomNumber: room.roomNumber,
          type: room.type,
        },
        create: {
          buildingId: building.id,
          floor: room.floor,
          roomNumber: room.roomNumber,
          type: room.type,
          systemId: room.systemId,
        },
      });
      roomsCount++;
    }

    // Import connections
    for (const conn of data.connections) {
      // Find rooms
      const fromRoom = await prisma.room.findUnique({
        where: { systemId: conn.fromSystemId }
      });
      const toRoom = await prisma.room.findUnique({
        where: { systemId: conn.toSystemId }
      });

      if (!fromRoom) {
        errors.push(`Source room not found: ${conn.fromSystemId}`);
        continue;
      }
      if (!toRoom) {
        errors.push(`Target room not found: ${conn.toSystemId}`);
        continue;
      }

      // Check if connection already exists
      const existing = await prisma.connection.findFirst({
        where: {
          OR: [
            { fromRoomId: fromRoom.id, toRoomId: toRoom.id },
            { fromRoomId: toRoom.id, toRoomId: fromRoom.id },
          ]
        }
      });

      if (existing) {
        // Update existing
        await prisma.connection.update({
          where: { id: existing.id },
          data: {
            lengthMeters: conn.lengthMeters,
            rackInfo: conn.rackInfo,
          }
        });
      } else {
        // Create new
        await prisma.connection.create({
          data: {
            fromRoomId: fromRoom.id,
            toRoomId: toRoom.id,
            lengthMeters: conn.lengthMeters,
            rackInfo: conn.rackInfo,
          }
        });
      }
      connectionsCount++;
    }

    return {
      success: true,
      imported: {
        buildings: buildingsCount,
        rooms: roomsCount,
        connections: connectionsCount,
      },
      errors,
    };
  } catch (error: any) {
    return {
      success: false,
      imported: {
        buildings: buildingsCount,
        rooms: roomsCount,
        connections: connectionsCount,
      },
      errors: [...errors, error.message],
    };
  }
}
