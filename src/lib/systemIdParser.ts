import type { SystemId } from '@/types';

/**
 * Parse a System ID string into its components
 * Format: IBX:FLOOR:ROOM[:CUSTOMER]
 * Examples:
 *   - FR2:01:50900
 *   - FR2:01:50900:Vodafone
 *   - MU1:UG:NSE-01
 */
export function parseSystemId(systemId: string): SystemId | null {
  const parts = systemId.split(':');
  
  if (parts.length < 3) {
    return null;
  }
  
  return {
    ibx: parts[0],
    floor: parts[1],
    room: parts[2],
    customer: parts[3] || undefined
  };
}

/**
 * Validate if a system ID string has valid format
 */
export function isValidSystemId(systemId: string): boolean {
  return parseSystemId(systemId) !== null;
}

/**
 * Build a system ID string from components
 */
export function buildSystemId(components: SystemId): string {
  const base = `${components.ibx}:${components.floor}:${components.room}`;
  return components.customer ? `${base}:${components.customer}` : base;
}

/**
 * Get the base system ID without customer
 */
export function getBaseSystemId(systemId: string): string | null {
  const parsed = parseSystemId(systemId);
  if (!parsed) return null;
  
  return `${parsed.ibx}:${parsed.floor}:${parsed.room}`;
}
