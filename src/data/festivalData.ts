import { Stage, Act, FestivalDay, WalkingDistance } from '../types';
import rawScheduleCsv from '../../festival_schedule.csv?raw';

export const FESTIVAL_STAGES: Stage[] = [
  {
    id: 'main_stage',
    name: 'Main Stage presented by 3',
    shortName: 'Main Stage',
    sponsor: '3',
    color: '#f59e0b', // amber
    bgGradient: 'from-amber-500/20 to-amber-600/5',
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
    badgeText: 'text-amber-400',
    category: 'main',
    description: 'The monumental centerpiece of Stradbally Hall hosting global headliners, iconic legends, and massive festival spectacles.',
    capacity: '70,000+',
    coordinates: { x: 42, y: 55 },
  },
  {
    id: 'electric_arena',
    name: 'Electric Arena',
    shortName: 'Electric Arena',
    color: '#3b82f6', // blue
    bgGradient: 'from-blue-500/20 to-blue-600/5',
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
    badgeText: 'text-blue-400',
    category: 'arena',
    description: 'A massive covered big-top arena delivering roaring indie anthems, electronic juggernauts, and stadium-energy sets.',
    capacity: '18,000',
    coordinates: { x: 26, y: 38 },
  },
  {
    id: 'rankins_wood',
    name: "Rankin's Wood",
    shortName: "Rankin's Wood",
    color: '#10b981', // emerald
    bgGradient: 'from-emerald-500/20 to-emerald-600/5',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    badgeText: 'text-emerald-400',
    category: 'tent',
    description: 'The fan-favourite wooded tent showcasing cutting-edge international alternative acts, breakout hip-hop, and indie darlings.',
    capacity: '12,000',
    coordinates: { x: 70, y: 44 },
  },
  {
    id: 'terminus',
    name: 'Terminus (Red Bull)',
    shortName: 'Terminus',
    sponsor: 'Red Bull',
    color: '#a855f7', // purple
    bgGradient: 'from-purple-500/20 to-purple-600/5',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    badgeText: 'text-purple-400',
    category: 'electronic',
    description: 'High-octane electronic sanctuary featuring massive kinetic visual installations, heavy bass, techno, and electro sensations.',
    capacity: '8,000',
    coordinates: { x: 80, y: 22 },
  },
];

// Map stage names from CSV to stage IDs
const STAGE_NAME_TO_ID: Record<string, string> = {
  'main stage': 'main_stage',
  'main stage presented by 3': 'main_stage',
  'electric arena': 'electric_arena',
  "rankin's wood": 'rankins_wood',
  'rankins wood': 'rankins_wood',
  'terminus': 'terminus',
  'red bull terminus': 'terminus',
  'terminus (red bull)': 'terminus',
};

// Known genre & origin metadata for rich UI display
const ACT_METADATA: Record<string, { genre: string; isIrish?: boolean; origin?: string; description?: string }> = {
  'Jade': { genre: 'Pop / R&B', isIrish: false, origin: 'South Shields, UK', description: 'Little Mix icon Jade Thirlwall delivers infectious pop anthems and bold choreography.' },
  'Zara Larsson': { genre: 'Dance-Pop / Electro-Pop', isIrish: false, origin: 'Stockholm, Sweden', description: 'Swedish pop powerhouse bringing global chart-toppers and dazzling stage production.' },
  'Sombr': { genre: 'Indie Pop / Alt-Pop', isIrish: false, origin: 'New York, USA', description: 'Viral indie breakout star delivering emotional, atmospheric anthems under the night sky.' },
  'Lewis Capaldi': { genre: 'Pop / Singer-Songwriter', isIrish: false, origin: 'Glasgow, Scotland', description: 'Colossal stadium singalongs, powerful ballads, and heartfelt humor.' },
  'Gurriers': { genre: 'Post-Punk / Noise Rock', isIrish: true, origin: 'Dublin, Ireland', description: 'Blistering, ferocious Dublin post-punk outfit opening the Electric Arena with visceral energy.' },
  'Wunderhorse': { genre: 'Alt-Rock / Grunge', isIrish: false, origin: 'London, UK', description: "Raw grunge guitars and roaring arena choruses from Jacob Slater's outfit." },
  'Wolf Alice': { genre: 'Alt-Rock / Dream Pop', isIrish: false, origin: 'London, UK', description: "Mercury Prize-winning alternative icons bringing Ellie Rowsell's transcendent vocals and blistering rock." },
  'Ben Hemsley': { genre: 'Trance / Rave / House', isIrish: false, origin: 'Newcastle, UK', description: 'Trance and rave superstar closing Friday night with euphoric, festival-defining drops.' },
  'Darren Kiely': { genre: 'Folk-Pop / Singer-Songwriter', isIrish: true, origin: 'Millstreet, Co. Cork, Ireland', description: 'Irish breakout folk sensation with soaring vocals and emotional acoustic storytelling.' },
  'Men I Trust': { genre: 'Indie Pop / Dream Pop', isIrish: false, origin: 'Montreal, Canada', description: 'Velvety smooth Canadian indie dream-pop trio crafting hypnotic basslines and lush vintage grooves.' },
  'JPEGMAFIA': { genre: 'Experimental Hip-Hop', isIrish: false, origin: 'Baltimore / New York, USA', description: 'Experimental rap visionary unleashing unhinged energy, radical beats, and chaotic crowd command.' },
  'Loyle Carner': { genre: 'Conscious Hip-Hop / Jazz Rap', isIrish: false, origin: 'South London, UK', description: 'Celebrated UK lyricist headlining with deeply poetic, jazzy, soul-stirring hip-hop.' },
  'Faster Horses': { genre: 'Techno / Trance', isIrish: false, origin: 'Manchester, UK', description: 'Fast-paced, high-energy trance and techno kicks kicking off Red Bull Terminus.' },
  'Dart': { genre: 'House / Breakbeat / Techno', isIrish: true, origin: 'Dublin, Ireland', description: 'Dublin DJ & producer delivering pulsating breaks, electro rhythms, and relentless 4/4 momentum.' },
  'X Club.': { genre: 'Hard Techno / Industrial Rave', isIrish: false, origin: 'Brisbane / London', description: 'Hard-hitting, relentless electronic duo closing Friday at Terminus with warehouse-grade techno power.' },
  'City Stages ft. Tinie Tempah': { genre: 'Grime / Hip-Hop / Pop', isIrish: false, origin: 'London, UK', description: 'Special Three City Stages showcase featuring UK grime legend Tinie Tempah alongside emerging Irish artists.' },
  'Role Model': { genre: 'Indie Pop / Alt-Pop', isIrish: false, origin: 'Los Angeles, USA', description: 'Tucker Pillsbury brings charismatic indie-pop hooks, witty lyricism, and effortless afternoon stage charm.' },
  'The Mary Wallopers': { genre: 'Contemporary Irish Folk / Ballads', isIrish: true, origin: 'Dundalk, Co. Louth, Ireland', description: 'Dundalk folk sensations bringing rowdy ballads, razor-sharp wit, and massive Irish singalongs.' },
  'CMAT': { genre: 'Country Pop / Indie Glam', isIrish: true, origin: 'Dublin, Ireland', description: 'Global pop superstar CMAT in a historic Saturday night penultimate slot packed with glamour and theatrics.' },
  'Gorillaz': { genre: 'Alt-Rock / Hip-Hop / Electronic', isIrish: false, origin: 'London, UK', description: "Damon Albarn's virtual cartoon supergroup headlining Saturday with iconic visuals and legendary hits." },
  'Violet Grohl': { genre: 'Alt-Rock / Indie Pop', isIrish: false, origin: 'Los Angeles, USA', description: 'Soulful, captivating singer-songwriter opening Saturday afternoon in the Electric Arena.' },
  'Jessie Murph': { genre: 'Country / Pop / Alt-R&B', isIrish: false, origin: 'Alabama, USA', description: 'Genre-blending powerhouse delivering raw vocals and viral, emotionally charged storytelling.' },
  'The Undertones': { genre: 'Punk Rock / Power Pop', isIrish: true, origin: 'Derry, Northern Ireland', description: 'Derry punk legends firing up the tent with Teenage Kicks, Jimmy Jimmy, and timeless power-pop classics.' },
  'Kyla Cobbler': { genre: 'Comedy / Stand-Up', isIrish: true, origin: 'Ballincollig, Cork, Ireland', description: 'Cork internet comedy phenomenon bringing riotous laughs and unapologetic energy.' },
  'The Stunning': { genre: 'Irish Rock / Alt-Pop', isIrish: true, origin: 'Galway, Ireland', description: 'Galway rock royalty performing Brewing Up a Storm, Half Past Two, and crowd-rousing anthems.' },
  'Damien Dempsey': { genre: 'Urban Folk / Reggae / Ballads', isIrish: true, origin: 'Donaghmede, Dublin, Ireland', description: 'An emotional Stradbally tradition: Dempsey leads thousands in spine-tingling community singalongs.' },
  'Interplanetary Criminal': { genre: 'UK Garage / Speed Garage', isIrish: false, origin: 'Manchester, UK', description: 'UK garage champion spinning bass-heavy dubs, 2-step anthems, and B.O.T.A. festival heat.' },
  'Duke Dumont': { genre: 'Deep House / Club', isIrish: false, origin: 'London, UK', description: "Electronic music giant headlining Saturday in the Electric Arena with Ocean Drive and Won't Look Back." },
  'Nieve Ella': { genre: 'Indie Pop / Indie Rock', isIrish: false, origin: 'Wolverhampton, UK', description: 'Shimmering indie guitars and candid, relatable coming-of-age indie anthems.' },
  'Cliffords': { genre: 'Indie Rock / Alt-Pop', isIrish: true, origin: 'Cork, Ireland', description: 'Buzzing Cork indie outfit with driving hooks, heartfelt lyricism, and dynamic guitars.' },
  'Audrey Hobert': { genre: 'Folk-Pop / Singer-Songwriter', isIrish: false, origin: 'Los Angeles, USA', description: "Introspective storytelling and delicate folk-pop melodies echoing through Rankin's Wood." },
  'Aaron Rowe': { genre: 'Acoustic Folk / Singer-Songwriter', isIrish: true, origin: 'Ireland', description: 'Rising Irish songwriter bringing rich vocal tones and acoustic sincerity.' },
  'Oklou': { genre: 'Hyperpop / Ambient Pop', isIrish: false, origin: 'Paris, France', description: 'French producer and vocalist Marylou Mayniel crafting ethereal, futuristic ambient pop.' },
  'The Academic': { genre: 'Indie Rock / Post-Punk Revival', isIrish: true, origin: 'Mullingar, Co. Westmeath, Ireland', description: 'Mullingar indie rockers bringing explosive riffs, Bear Claws, and sun-soaked crowd anthems.' },
  'The Scratch': { genre: 'Acoustic Metal / Folk Punk', isIrish: true, origin: 'Dublin, Ireland', description: 'Acoustic metal chaos, ferocious cajón beats, and manic Dublin brilliance.' },
  'ETC': { genre: 'Techno / Electronic', isIrish: false, origin: 'Ireland', description: 'Afternoon driving electronic sets setting the pulse at Red Bull Terminus.' },
  'Kayleigh Glynn': { genre: 'Hard Dance / Trance', isIrish: true, origin: 'Galway, Ireland', description: 'Fast-rising Irish selector delivering bouncy, uplifting trance and eurodance energy.' },
  'Twofaced': { genre: 'Techno / Hardgroove', isIrish: true, origin: 'Dublin, Ireland', description: 'Irish techno duo laying down grooving tribal rhythms and heavy basslines.' },
  'Clouds': { genre: 'Hardcore Techno / Rave', isIrish: false, origin: 'Perth, Scotland', description: 'Scottish heavyweight techno duo pushing industrial sound design and high-BPM fury.' },
  'Belters Only': { genre: 'Irish House / Dance', isIrish: true, origin: 'Dublin, Ireland', description: 'Dublin chart-conquering dance duo closing Saturday with Make Me Feel Good and pure club energy.' },
  'RTÉ Céilí Mór': { genre: 'Traditional Irish Céilí', isIrish: true, origin: 'Ireland', description: 'The ultimate Stradbally Sunday tradition: thousands dancing the Walls of Limerick on the Main Stage lawn.' },
  'James Marriott': { genre: 'Alt-Rock / Indie Rock', isIrish: false, origin: 'Brighton, UK', description: 'Dynamic Brighton indie-rocker delivering crunchy riffs, catchy hooks, and energetic stage antics.' },
  'Van Morrison': { genre: 'Celtic Soul / R&B / Folk', isIrish: true, origin: 'Belfast, Northern Ireland', description: 'Legendary Belfast icon performing soul-stirring classics from an incomparable six-decade catalogue.' },
  'The Saw Doctors': { genre: 'Irish Rock / Folk Rock', isIrish: true, origin: 'Tuam, Co. Galway, Ireland', description: 'Tuam legends ignite the festival with N17, I Useta Lover, and joyous Sunday afternoon spirit.' },
  'Djo': { genre: 'Psychedelic Pop / Synth-Pop', isIrish: false, origin: 'Massachusetts, USA', description: "Joe Keery's retro synth-pop project delivering the global viral hit End of Beginning." },
  'Amble': { genre: 'Contemporary Folk / Acoustic', isIrish: true, origin: 'Ireland', description: 'Irish folk phenomenon Amble in the massive Sunday evening Main Stage slot with spellbinding harmonies.' },
  'Fontaines D.C.': { genre: 'Post-Punk / Alt-Rock', isIrish: true, origin: 'Dublin, Ireland', description: 'Electric Picnic 2026 grand finale: Grammy-nominated Dublin rock icons headline Stradbally Hall with Romance.' },
  "People I've Met": { genre: 'Indie Pop / Folk', isIrish: true, origin: 'Ireland', description: 'Subtle songwriting and soulful indie textures opening Sunday in the Electric Arena.' },
  'Rose Gray': { genre: 'Rave-Pop / 90s House Pop', isIrish: false, origin: 'London, UK', description: '90s rave-inspired dance-pop bringing club grooves and sunny vocal melodies to Stradbally.' },
  'Florence Road': { genre: 'Indie Rock / Alt-Pop', isIrish: true, origin: 'Wicklow / Dublin, Ireland', description: 'Irish teenage indie rock sensation with soaring choruses and infectious festival stage energy.' },
  'Skye Newman': { genre: 'Alt-Pop / Singer-Songwriter', isIrish: false, origin: 'London, UK', description: 'Rising vocalist delivering emotive, atmospheric indie-pop melodies.' },
  'Mick Flannery': { genre: 'Folk / Blues / Singer-Songwriter', isIrish: true, origin: 'Blarney, Co. Cork, Ireland', description: 'Acclaimed Cork songwriter bringing gritty, poetic blues-folk and raw vocal mastery to the big top.' },
  'Skepta': { genre: 'Grime / UK Rap / House', isIrish: false, origin: 'London, UK', description: 'Mercury Prize winner and grime trailblazer bringing high-octane rap anthems and unmatched crowd control.' },
  'Obskür': { genre: 'Irish House / 90s Club', isIrish: true, origin: 'Dublin, Ireland', description: 'Dublin house powerhouse closing Sunday night in the Electric Arena with unyielding dance energy.' },
  'Bleech 9:3': { genre: 'Alt-Rock / Grunge', isIrish: true, origin: 'Ireland', description: "Fuzzy guitars and energetic alternative rock kicking off Sunday in Rankin's Wood." },
  'Keo': { genre: 'Indie Rock / Alt-Pop', isIrish: false, origin: 'UK', description: 'Buzzing indie rock newcomers with punchy guitar riffs and magnetic hooks.' },
  'Tyler Ballgame': { genre: 'Garage Rock / Indie', isIrish: false, origin: 'USA', description: 'Spirited garage rock and infectious indie attitude lighting up the afternoon tent.' },
  'Madra Salach': { genre: 'Gaeilge Punk / Noise Rock', isIrish: true, origin: 'Galway / Dublin, Ireland', description: 'Raw, uncompromised Irish-language punk rock delivering fierce energy and noisy riffs.' },
  'Adéla': { genre: 'Alt-R&B / Neo-Soul', isIrish: false, origin: 'London, UK', description: 'Smooth vocals, lush chords, and modern alt-R&B grooves in the wooded tent.' },
  'Ravyn Lenae': { genre: 'R&B / Neo-Soul / Electronic', isIrish: false, origin: 'Chicago, USA', description: 'Chicago R&B visionary with a dazzling four-octave vocal range and futuristic soul melodies.' },
  'Geese': { genre: 'Art Rock / Post-Punk / Country Rock', isIrish: false, origin: 'Brooklyn, New York, USA', description: "Brooklyn art-rock sensations unleashing Cameron Winter's feral vocals and dizzying musical shifts." },
  'Hermitage Green': { genre: 'Acoustic Folk Rock / Irish Roots', isIrish: true, origin: 'Limerick, Ireland', description: 'Limerick acoustic powerhouse closing Rankin’s Wood with thunderous bodhrán rhythms and harmonies.' },
  'Derv': { genre: 'Techno / Electro', isIrish: true, origin: 'Ireland', description: 'Deep driving techno grooves opening Sunday evening’s session at Red Bull Terminus.' },
  'CamrinWatsin': { genre: 'Tech House / Speed Garage', isIrish: true, origin: 'Ireland', description: 'Irish producer and DJ dropping bouncy tech-house rhythms and heavy basslines.' },
  'Effy': { genre: 'Breakbeat / Acid / Techno', isIrish: false, origin: 'London, UK', description: 'BBC Radio 1 resident bringing high-energy acid lines, rave breaks, and electronic heat.' },
  'Malugi': { genre: 'Eurodance / Trance / House', isIrish: false, origin: 'Berlin, Germany', description: 'Berlin dance virtuoso closing out Electric Picnic 2026 at Terminus with euphoric dance bliss.' },
};

// Helper to calculate minutes relative to 12:00 PM (Midday)
// 12:00 PM = 0, 13:00 = 60, ..., 24:00 = 720, 01:00 (next day) = 780
export function parseFestivalTime(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  // If time is between 00:00 and 05:00, it's late night (after midnight)
  if (h < 6) {
    return (h + 24 - 12) * 60 + m;
  }
  return (h - 12) * 60 + m;
}

export function formatTimeDisplay(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 && h < 24 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  const minStr = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
  return `${hour12}${minStr} ${period}`;
}

export function parseScheduleFromCsv(csvText: string): Act[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header line to dynamically determine column indices (supports both orders)
  const header = lines[0].split(',').map((col) => col.trim().toLowerCase());
  const stageIdx = header.findIndex((h) => h === 'stage');
  const dayIdx = header.findIndex((h) => h === 'day');
  const timeIdx = header.findIndex((h) => h === 'time');
  const actIdx = header.findIndex((h) => h === 'act' || h === 'band' || h === 'artist');

  const acts: Act[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Handle CSV splitting (simple comma split)
    const cols = rawLine.split(',').map((c) => c.trim());
    const stageName = cols[stageIdx >= 0 ? stageIdx : 0] || '';
    const dayRaw = (cols[dayIdx >= 0 ? dayIdx : 1] || '').toLowerCase() as FestivalDay;
    const timeRange = cols[timeIdx >= 0 ? timeIdx : 2] || '';
    const actName = cols[actIdx >= 0 ? actIdx : 3] || '';

    if (!stageName || !dayRaw || !timeRange || !actName) continue;

    const stageId = STAGE_NAME_TO_ID[stageName.toLowerCase()] || stageName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const [startRaw, endRaw] = timeRange.split('-').map((t) => t.trim());

    if (!startRaw || !endRaw) continue;

    const startMinutes = parseFestivalTime(startRaw);
    const endMinutes = parseFestivalTime(endRaw);
    const durationMinutes = endMinutes - startMinutes;
    const displayTime = `${formatTimeDisplay(startRaw)} - ${formatTimeDisplay(endRaw)}`;

    const slug = `${dayRaw}_${stageId}_${actName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const meta = ACT_METADATA[actName] || {
      genre: 'Music',
      isIrish: false,
      origin: '',
      description: `${actName} live at Electric Picnic 2026 on ${stageName}.`,
    };

    acts.push({
      id: slug,
      name: actName,
      stageId,
      day: dayRaw,
      startTime: startRaw,
      endTime: endRaw,
      displayTime,
      startMinutes,
      endMinutes,
      durationMinutes,
      genre: meta.genre,
      isIrish: meta.isIrish,
      description: meta.description || `${actName} performing live on the ${stageName} at Electric Picnic 2026.`,
      membersOrOrigin: meta.origin,
    });
  }

  return acts;
}

// Active dataset parsed dynamically from /festival_schedule.csv
export const FESTIVAL_ACTS: Act[] = parseScheduleFromCsv(rawScheduleCsv);

// Realistic walking distances between Stradbally stages (in minutes)
export const WALKING_DISTANCES: WalkingDistance[] = [
  { fromStageId: 'main_stage', toStageId: 'electric_arena', walkingMinutes: 6, distanceMeters: 380 },
  { fromStageId: 'main_stage', toStageId: 'rankins_wood', walkingMinutes: 8, distanceMeters: 520 },
  { fromStageId: 'main_stage', toStageId: 'terminus', walkingMinutes: 12, distanceMeters: 750 },
  { fromStageId: 'electric_arena', toStageId: 'rankins_wood', walkingMinutes: 5, distanceMeters: 320 },
  { fromStageId: 'electric_arena', toStageId: 'terminus', walkingMinutes: 10, distanceMeters: 640 },
  { fromStageId: 'rankins_wood', toStageId: 'terminus', walkingMinutes: 9, distanceMeters: 550 },
];

export function getWalkingTime(stageA: string, stageB: string): { minutes: number; meters: number } {
  if (stageA === stageB) return { minutes: 1, meters: 50 };
  const route = WALKING_DISTANCES.find(
    (w) =>
      (w.fromStageId === stageA && w.toStageId === stageB) ||
      (w.fromStageId === stageB && w.toStageId === stageA)
  );
  return route ? { minutes: route.walkingMinutes, meters: route.distanceMeters } : { minutes: 8, meters: 500 };
}
