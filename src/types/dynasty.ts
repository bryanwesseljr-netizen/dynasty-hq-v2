import type { Timestamp } from 'firebase/firestore';

export type CareerMode = 'RTG' | 'OC' | 'HC';
export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
export type GameResult = 'W' | 'L';
export type HomeAway = 'Home' | 'Away' | 'Neutral';
export type RecruitingTier = 'High' | 'Medium' | 'Low' | 'None';

export interface DynastyProfile {
  displayName: string;
  position: string;
  jerseyNumber: string;
  classYear: string;
  archetype: string;
  stars: number;
  overall: number;
  almaMater: string;
  prestige: string;
  contractYears: number;
  bio: string;
}

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
  profile?: DynastyProfile;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface DynastyGame {
  id: string;
  season: number;
  week: number;
  opponent: string;
  result: GameResult;
  location: HomeAway;
  teamScore: number;
  opponentScore: number;
  passYards: number;
  passTouchdowns: number;
  rushYards: number;
  rushTouchdowns: number;
  interceptions: number;
  notes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface RecruitSchool {
  id: string;
  school: string;
  interest: number;
  tier: RecruitingTier;
  offered: boolean;
  rank: number;
  notes: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type CreateDynastyInput = Pick<Dynasty, 'name' | 'mode' | 'school'>;
export type DynastyUpdate = Partial<Pick<Dynasty, 'name' | 'mode' | 'school' | 'season' | 'week' | 'wins' | 'losses' | 'profile'>>;
export type CreateGameInput = Omit<DynastyGame, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateGameInput = Partial<CreateGameInput>;
export type CreateRecruitInput = Omit<RecruitSchool, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRecruitInput = Partial<CreateRecruitInput>;

export const defaultDynastyProfile: DynastyProfile = {
  displayName: '',
  position: 'QB',
  jerseyNumber: '#2',
  classYear: 'Senior',
  archetype: 'Dual-Threat',
  stars: 3,
  overall: 70,
  almaMater: '',
  prestige: 'C+',
  contractYears: 3,
  bio: '',
};

export function interestToTier(interest: number): RecruitingTier {
  if (interest >= 75) return 'High';
  if (interest >= 50) return 'Medium';
  if (interest >= 25) return 'Low';
  return 'None';
}
