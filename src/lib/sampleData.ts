import { prisma } from './prisma';

/**
 * Load sample data into the database
 */
export async function loadSampleData() {
  // Clear existing data
  await prisma.connection.deleteMany();
  await prisma.room.deleteMany();
  await prisma.building.deleteMany();

  // Create buildings
  const fr2 = await prisma.building.create({
    data: {
      ibxCode: 'FR2',
      name: 'Frankfurt 2',
    }
  });

  const mu1 = await prisma.building.create({
    data: {
      ibxCode: 'MU1',
      name: 'Munich 1',
    }
  });

  // Create rooms
  const rooms = await prisma.room.createMany({
    data: [
      // Frankfurt Building
      { buildingId: fr2.id, floor: '01', roomNumber: '50900', type: 'NORMAL', systemId: 'FR2:01:50900' },
      { buildingId: fr2.id, floor: '01', roomNumber: 'NSE-01', type: 'BACKBONE', systemId: 'FR2:01:NSE-01' },
      { buildingId: fr2.id, floor: '02', roomNumber: '60100', type: 'NORMAL', systemId: 'FR2:02:60100' },
      
      // Munich Building
      { buildingId: mu1.id, floor: 'UG', roomNumber: 'NSE-01', type: 'BACKBONE', systemId: 'MU1:UG:NSE-01' },
      { buildingId: mu1.id, floor: '01', roomNumber: '70200', type: 'NORMAL', systemId: 'MU1:01:70200' },
    ]
  });

  // Get created rooms for connections
  const fr2_50900 = await prisma.room.findUnique({ where: { systemId: 'FR2:01:50900' } });
  const fr2_nse = await prisma.room.findUnique({ where: { systemId: 'FR2:01:NSE-01' } });
  const fr2_60100 = await prisma.room.findUnique({ where: { systemId: 'FR2:02:60100' } });
  const mu1_nse = await prisma.room.findUnique({ where: { systemId: 'MU1:UG:NSE-01' } });
  const mu1_70200 = await prisma.room.findUnique({ where: { systemId: 'MU1:01:70200' } });

  // Create connections
  if (fr2_50900 && fr2_nse && fr2_60100 && mu1_nse && mu1_70200) {
    await prisma.connection.createMany({
      data: [
        // FR2: Room 50900 → NSE
        { fromRoomId: fr2_50900.id, toRoomId: fr2_nse.id, lengthMeters: 50, rackInfo: 'RackA-15 → RackNSE-05' },
        
        // FR2: Room 60100 → NSE
        { fromRoomId: fr2_60100.id, toRoomId: fr2_nse.id, lengthMeters: 75, rackInfo: 'RackB-23 → RackNSE-08' },
        
        // FR2 NSE ↔ MU1 NSE (cross-building)
        { fromRoomId: fr2_nse.id, toRoomId: mu1_nse.id, lengthMeters: 350000, rackInfo: 'Dark Fiber Link' },
        
        // MU1: NSE → Room 70200
        { fromRoomId: mu1_nse.id, toRoomId: mu1_70200.id, lengthMeters: 60, rackInfo: 'RackNSE-12 → RackC-07' },
      ]
    });
  }

  return {
    buildings: 2,
    rooms: 5,
    connections: 4,
  };
}
