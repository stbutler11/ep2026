import { Stage } from '../types';

export interface StageConfig {
  name: string;
  shortName?: string;
  category?: 'main' | 'arena' | 'tent' | 'electronic' | 'comedy' | 'special';
  color?: string;
  description?: string;
  capacity?: string;
  sponsor?: string;
  coordinates?: { x: number; y: number };
}

// Stage ID slugifier consistent with schedule parsing
export function getStageIdFromName(name: string): string {
  const n = name.toLowerCase().trim();
  if (n === 'main stage' || n === 'main stage presented by 3') return 'main_stage';
  if (n === 'electric arena') return 'electric_arena';
  if (n === "rankin's wood" || n === 'rankins wood') return 'rankins_wood';
  if (n === 'terminus' || n === 'red bull terminus' || n === 'terminus (red bull)') return 'terminus';
  if (n === 'comedy arena') return 'comedy_arena';
  if (n === 'anachronica') return 'anachronica';
  if (n === 'artlot') return 'artlot';
  if (n === 'fishtown') return 'fishtown';
  if (n === 'salty dog') return 'salty_dog';
  if (n === 'trailer park - main stage' || n === 'trailer park') return 'trailer_park';
  if (n === 'trenchtown - treasure beach' || n === 'trenchtown') return 'trenchtown';
  if (n === 'glow depot') return 'glow_depot';
  if (n === 'guinness lovely times stage') return 'guinness_lovely_times';
  if (n === 'hazelwood - chollchoill' || n === 'hazelwood') return 'hazelwood';
  if (n === 'croi - main stage' || n === 'croi') return 'croi_main_stage';
  return n.replace(/[^a-z0-9]/g, '_');
}

// Curated metadata for major and prominent stages
const KNOWN_STAGE_METADATA: Record<string, Partial<Stage>> = {
  'main stage': {
    name: 'Main Stage',
    shortName: 'Main Stage',
    sponsor: '3',
    color: '#f59e0b', // amber
    category: 'main',
    description: 'The monumental centerpiece of Stradbally Hall hosting global headliners, iconic legends, and massive festival spectacles.',
    capacity: '70,000+',
    coordinates: { x: 42, y: 55 },
  },
  'electric arena': {
    name: 'Electric Arena',
    shortName: 'Electric Arena',
    color: '#3b82f6', // blue
    category: 'arena',
    description: 'A massive covered big-top arena delivering roaring indie anthems, electronic juggernauts, and stadium-energy sets.',
    capacity: '18,000',
    coordinates: { x: 26, y: 38 },
  },
  "rankins wood": {
    name: "Rankin's Wood",
    shortName: "Rankin's Wood",
    color: '#10b981', // emerald
    category: 'tent',
    description: 'The fan-favourite wooded tent showcasing cutting-edge international alternative acts, breakout hip-hop, and indie darlings.',
    capacity: '12,000',
    coordinates: { x: 70, y: 44 },
  },
  'terminus': {
    name: 'Terminus (Red Bull)',
    shortName: 'Terminus',
    sponsor: 'Red Bull',
    color: '#a855f7', // purple
    category: 'electronic',
    description: 'High-octane electronic sanctuary featuring massive kinetic visual installations, heavy bass, techno, and electro sensations.',
    capacity: '8,000',
    coordinates: { x: 80, y: 22 },
  },
  'comedy arena': {
    name: 'Comedy Arena',
    shortName: 'Comedy Arena',
    color: '#ec4899', // pink
    category: 'comedy',
    description: 'Ireland’s premier festival comedy tent bursting with world-class stand-up comedy, razor-sharp MCs, and side-splitting sets.',
    capacity: '5,000',
    coordinates: { x: 34, y: 65 },
  },
  'anachronica': {
    name: 'Anachronica',
    shortName: 'Anachronica',
    color: '#ef4444', // red
    category: 'electronic',
    description: 'The legendary dystopian forest rave beneath the iconic abandoned transmission tower, shaking Stradbally into the early hours.',
    capacity: '6,000',
    coordinates: { x: 88, y: 68 },
  },
  'artlot': {
    name: 'Artlot',
    shortName: 'Artlot',
    color: '#f97316', // orange
    category: 'special',
    description: 'A vibrant creative haven filled with visual spectacles, boundary-pushing indie artists, pop-up performances, and quirky late-night energy.',
    capacity: '2,500',
    coordinates: { x: 62, y: 72 },
  },
  'salty dog': {
    name: 'Salty Dog',
    shortName: 'Salty Dog',
    color: '#06b6d4', // cyan
    category: 'special',
    description: 'The iconic shipwreck nestled in the woods delivering pirate rock n roll, gritty blues, and riotous forest singalongs.',
    capacity: '4,000',
    coordinates: { x: 75, y: 58 },
  },
  'trailer park - main stage': {
    name: 'Trailer Park - Main Stage',
    shortName: 'Trailer Park',
    color: '#84cc16', // lime
    category: 'special',
    description: 'Retro caravan madness, eccentric visual curiosities, and infectious party bands in a delightfully chaotic retro village.',
    capacity: '3,500',
    coordinates: { x: 50, y: 78 },
  },
  'trenchtown - treasure beach': {
    name: 'Trenchtown',
    shortName: 'Trenchtown',
    color: '#eab308', // yellow
    category: 'special',
    description: 'Tropical oasis serving up authentic reggae, ska, dancehall, roots music, Jamaican cuisine, and warm community vibes.',
    capacity: '4,000',
    coordinates: { x: 18, y: 60 },
  },
  'fishtown': {
    name: 'Fishtown',
    shortName: 'Fishtown',
    color: '#14b8a6', // teal
    category: 'tent',
    description: 'Jerry Fish’s whimsical carnival emporium featuring cabaret, soulful indie gems, sideshow freaks, and theatrical rock.',
    capacity: '3,000',
    coordinates: { x: 60, y: 30 },
  },
  'hazelwood - chollchoill': {
    name: 'Hazelwood (Chollchoill)',
    shortName: 'Hazelwood',
    color: '#8b5cf6', // violet
    category: 'special',
    description: 'Enchanted woodland sanctuary celebrating Irish theatre, spoken word, visual projection art, and atmospheric folk soundscapes.',
    capacity: '2,000',
    coordinates: { x: 82, y: 40 },
  },
  'guinness lovely times stage': {
    name: 'Guinness Lovely Times Stage',
    shortName: 'Guinness Stage',
    color: '#d97706', // dark amber
    category: 'tent',
    description: 'A cozy traditional hub combining creamy pints, energetic Irish trad sessions, singalongs, and breakout homegrown songwriters.',
    capacity: '2,500',
    coordinates: { x: 30, y: 52 },
  },
  'coke studio': {
    name: 'Coke Studio',
    shortName: 'Coke Studio',
    color: '#e11d48', // rose
    category: 'electronic',
    description: 'Vibrant pop-up music studio hosting exclusive secret sets, dance anthems, viral talent, and upbeat crowd parties.',
    capacity: '2,000',
    coordinates: { x: 48, y: 35 },
  },
  'croi - main stage': {
    name: 'Croí - Main Stage',
    shortName: 'Croí Stage',
    color: '#22c55e', // green
    category: 'special',
    description: 'The pulsing heart of wellness and community, presenting folk fusion, contemporary céilís, and soothing organic melodies.',
    capacity: '3,000',
    coordinates: { x: 68, y: 80 },
  },
  'glow depot': {
    name: 'Glow Depot',
    shortName: 'Glow Depot',
    color: '#06b6d4', // cyan
    category: 'electronic',
    description: 'Neon-infused warehouse rave space bumping with energetic club hits, bass grooves, and lively DJ sets.',
    capacity: '2,500',
    coordinates: { x: 84, y: 78 },
  },
  'mindfield - the word stage': {
    name: 'Mindfield - The Word Stage',
    shortName: 'The Word Stage',
    color: '#6366f1', // indigo
    category: 'tent',
    description: 'The spoken word & poetry epicenter of Stradbally hosting lyrical battles, slam poetry, and acoustic lyricists.',
    capacity: '1,500',
    coordinates: { x: 22, y: 70 },
  },
  'global green - elements of change': {
    name: 'Global Green - Elements of Change',
    shortName: 'Global Green',
    color: '#16a34a', // green
    category: 'special',
    description: 'Eco-village showcasing sustainable innovation, climate discussions, acoustic grassroots music, and green workshops.',
    capacity: '2,000',
    coordinates: { x: 15, y: 75 },
  },
};

// Deterministic color palette for auto-generated stages
const COLOR_PALETTE = [
  '#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899',
  '#06b6d4', '#f97316', '#84cc16', '#14b8a6', '#8b5cf6',
  '#e11d48', '#6366f1', '#eab308', '#22c55e', '#d97706',
];

/**
 * Builds a comprehensive, deduplicated list of Stage objects from a list of stage names.
 */
export function buildStageList(stageNames: string[]): Stage[] {
  const uniqueNames = Array.from(new Set(stageNames.map(s => s.trim()).filter(Boolean)));
  
  // Sort with flagship stages first, then alphabetically
  const priorityOrder = [
    'main stage',
    'electric arena',
    "rankin's wood",
    'rankins wood',
    'terminus',
    'comedy arena',
    'anachronica',
    'artlot',
    'salty dog',
    'trailer park - main stage',
    'trenchtown - treasure beach',
    'fishtown',
    'hazelwood - chollchoill',
    'guinness lovely times stage',
    'coke studio',
    'croi - main stage',
    'glow depot',
  ];

  uniqueNames.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const aIdx = priorityOrder.indexOf(aLower);
    const bIdx = priorityOrder.indexOf(bLower);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  return uniqueNames.map((name, idx) => {
    const id = getStageIdFromName(name);
    const key = name.toLowerCase();
    const meta = KNOWN_STAGE_METADATA[key];

    const fallbackColor = COLOR_PALETTE[idx % COLOR_PALETTE.length];
    const shortName = meta?.shortName || name.replace(/^(Mindfield - |Croi - |Little Picnic - |Brutropolis - |TOF - )/, '');
    
    let category: Stage['category'] = meta?.category || 'tent';
    if (!meta?.category) {
      if (key.includes('arena')) category = 'arena';
      else if (key.includes('comedy')) category = 'comedy';
      else if (key.includes('electronic') || key.includes('dance') || key.includes('rave') || key.includes('sound')) category = 'electronic';
      else if (key.includes('main')) category = 'main';
      else if (key.includes('theatre') || key.includes('food') || key.includes('green') || key.includes('picnic')) category = 'special';
    }

    return {
      id,
      name: meta?.name || name,
      shortName,
      sponsor: meta?.sponsor,
      color: meta?.color || fallbackColor,
      bgGradient: `from-[${meta?.color || fallbackColor}]/20 to-[${meta?.color || fallbackColor}]/5`,
      badgeBg: 'bg-neutral-800/80 border-neutral-700 text-neutral-300',
      badgeText: 'text-neutral-300',
      category,
      description: meta?.description || `${name} live stage at Stradbally Hall, Electric Picnic 2026.`,
      capacity: meta?.capacity || 'Open Stage',
      coordinates: meta?.coordinates || {
        x: 20 + ((idx * 17) % 65),
        y: 20 + ((idx * 23) % 65),
      },
    };
  });
}
