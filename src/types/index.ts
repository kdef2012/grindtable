export type TableStatus = 
  | 'available' 
  | 'reserved' 
  | 'occupied' 
  | 'ordering' 
  | 'check_dropped' 
  | 'dirty' 
  | 'blocked';

export type TableShape = 'round' | 'square' | 'rectangle' | 'l_shaped';
export type TableType = '2_top' | '4_top' | '6_top' | '8_top' | 'booth' | 'bar_seat' | 'high_top' | 'private' | 'patio';

export interface Position {
  x: number;
  y: number;
}

export interface TableElement {
  id: string;
  number: string;
  capacity: number;
  type: TableType;
  shape: TableShape;
  zone: string;
  position: Position;
  currentStatus: TableStatus;
  currentPartyId?: string;
  currentPartyName?: string;
  seatedAt?: number; // timestamp
  server?: string;
  notes?: string;
  mergedWith?: string[];
  width?: number;
  height?: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: number;
  elements: TableElement[];
}
