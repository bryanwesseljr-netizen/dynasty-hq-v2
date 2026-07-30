import type { Timestamp } from 'firebase/firestore';

export type CareerMode = 'RTG' | 'OC' | 'HC';

export interface Dynasty {
  id: string;
  ownerId: string;
  name: string;
  mode: CareerMode;
  school: string;
  season: number;
  week: number;
  wins: number;
  losses: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type CreateDynastyInput = Pick<Dynasty, 'name' | 'mode' | 'school'>;
