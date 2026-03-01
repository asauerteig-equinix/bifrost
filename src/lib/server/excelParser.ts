import * as XLSX from 'xlsx';

export interface ParsedBuilding {
  ibxCode: string;
  name: string;
}

export interface ParsedRoom {
  systemId: string;
  ibxCode: string;
  floor: string;
  roomNumber: string;
  type: 'NORMAL' | 'BACKBONE';
}

export interface ParsedConnection {
  fromSystemId: string;
  toSystemId: string;
  lengthMeters: number;
  rackInfo?: string;
}

export interface ParseResult {
  buildings: ParsedBuilding[];
  rooms: ParsedRoom[];
  connections: ParsedConnection[];
  errors: string[];
}

/**
 * Parse Excel/CSV file buffer
 */
export function parseExcelFile(buffer: Buffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const result: ParseResult = {
    buildings: [],
    rooms: [],
    connections: [],
    errors: [],
  };

  // Parse Buildings sheet
  if (workbook.SheetNames.includes('Buildings') || workbook.SheetNames.includes('buildings')) {
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'buildings');
    if (sheetName) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data as any[]) {
        if (row.ibxCode && row.name) {
          result.buildings.push({
            ibxCode: String(row.ibxCode).trim(),
            name: String(row.name).trim(),
          });
        }
      }
    }
  }

  // Parse Rooms sheet
  if (workbook.SheetNames.includes('Rooms') || workbook.SheetNames.includes('rooms')) {
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'rooms');
    if (sheetName) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data as any[]) {
        if (row.systemId && row.ibxCode && row.floor && row.roomNumber) {
          const type = String(row.type || 'NORMAL').toUpperCase();
          if (type !== 'NORMAL' && type !== 'BACKBONE') {
            result.errors.push(`Invalid room type for ${row.systemId}: ${type}`);
            continue;
          }

          result.rooms.push({
            systemId: String(row.systemId).trim(),
            ibxCode: String(row.ibxCode).trim(),
            floor: String(row.floor).trim(),
            roomNumber: String(row.roomNumber).trim(),
            type: type as 'NORMAL' | 'BACKBONE',
          });
        }
      }
    }
  }

  // Parse Connections sheet
  if (workbook.SheetNames.includes('Connections') || workbook.SheetNames.includes('connections')) {
    const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'connections');
    if (sheetName) {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);
      
      for (const row of data as any[]) {
        if (row.fromSystemId && row.toSystemId && row.lengthMeters != null) {
          const length = parseFloat(row.lengthMeters);
          if (isNaN(length) || length <= 0) {
            result.errors.push(`Invalid length for connection ${row.fromSystemId} → ${row.toSystemId}`);
            continue;
          }

          result.connections.push({
            fromSystemId: String(row.fromSystemId).trim(),
            toSystemId: String(row.toSystemId).trim(),
            lengthMeters: length,
            rackInfo: row.rackInfo ? String(row.rackInfo).trim() : undefined,
          });
        }
      }
    }
  }

  return result;
}
