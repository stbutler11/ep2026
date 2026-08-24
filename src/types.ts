export type FestivalDay = 'thursday' | 'friday' | 'saturday' | 'sunday';

export type PriorityLevel = 'must_see' | 'want_to_see' | 'maybe' | 'none';

export interface Stage {
  id: string;
  name: string;
  shortName: string;
  sponsor?: string;
  color: string; // Tailwind border & accent color representation
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  category: 'main' | 'arena' | 'tent' | 'electronic' | 'comedy' | 'special';
  description: string;
  capacity?: string;
  coordinates: { x: number; y: number }; // Relative coordinates on the map (0-100%)
}

export interface Act {
  id: string;
  name: string;
  stageId: string;
  day: FestivalDay;
  startTime: string; // e.g. "18:30" (24h format)
  endTime: string; // e.g. "19:45"
  displayTime: string; // e.g. "6:30 PM - 7:45 PM"
  startMinutes: number; // Minutes from 12:00 PM (12:00 = 0, 13:00 = 60, ..., 24:00 = 720, 01:00 = 780)
  endMinutes: number;
  durationMinutes: number;
  genre: string;
  isHeadliner?: boolean;
  isIrish?: boolean;
  description: string;
  spotifyUrl?: string;
  membersOrOrigin?: string;
}

export interface UserActPreference {
  actId: string;
  priority: PriorityLevel;
  notes?: string;
  alertOffsetMinutes?: number; // e.g. 15 mins before
  splitSet?: {
    watchFromMinutes: number;
    watchToMinutes: number;
  };
}

export interface ClashDetail {
  id: string;
  act1: Act;
  act2: Act;
  overlapStartMinutes: number;
  overlapEndMinutes: number;
  overlapDurationMinutes: number;
  severity: 'full' | 'major' | 'minor'; // full overlap, >30m overlap, <30m overlap
  walkingTimeMinutes: number;
}

export interface WalkingDistance {
  fromStageId: string;
  toStageId: string;
  walkingMinutes: number;
  distanceMeters: number;
}
