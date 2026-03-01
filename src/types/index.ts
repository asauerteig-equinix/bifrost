// Type definitions for BIFROST

export interface SystemId {
  ibx: string;      // Building Code (e.g., "FR2")
  floor: string;    // Floor (e.g., "01", "UG")
  room: string;     // Room Number (e.g., "50900")
  customer?: string; // Optional customer name
}

export interface RouteStep {
  systemId: string;
  roomType: 'NORMAL' | 'BACKBONE';
  rackInfo?: string;
}

export interface Route {
  path: RouteStep[];
  totalLength: number;
}

export interface RouteResponse {
  success: boolean;
  primaryRoute?: Route;
  redundantRoute?: Route | null;
  error?: string;
}

export interface Building {
  id: string;
  ibxCode: string;
  name: string;
}

export interface Room {
  id: string;
  buildingId: string;
  floor: string;
  roomNumber: string;
  type: 'NORMAL' | 'BACKBONE';
  systemId: string;
}

export interface Connection {
  id: string;
  fromRoomId: string;
  toRoomId: string;
  lengthMeters: number;
  rackInfo?: string | null;
}
