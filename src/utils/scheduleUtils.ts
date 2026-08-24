import { Act, ClashDetail, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { FESTIVAL_ACTS, FESTIVAL_STAGES, getWalkingTime } from '../data/festivalData';

// Helper to get priority rank (higher number = higher priority)
export function getPriorityWeight(priority: PriorityLevel): number {
  switch (priority) {
    case 'must_see':
      return 3;
    case 'want_to_see':
      return 2;
    case 'maybe':
      return 1;
    case 'none':
    default:
      return 0;
  }
}

export function getPriorityLabel(priority: PriorityLevel): string {
  switch (priority) {
    case 'must_see':
      return 'Must See';
    case 'want_to_see':
      return 'Want to See';
    case 'maybe':
      return 'Maybe / Backup';
    case 'none':
    default:
      return 'Not Selected';
  }
}

export function getPriorityBadgeColor(priority: PriorityLevel): {
  bg: string;
  text: string;
  border: string;
  solidBg: string;
} {
  switch (priority) {
    case 'must_see':
      return {
        bg: 'bg-amber-500/15',
        text: 'text-amber-300',
        border: 'border-amber-500/40',
        solidBg: 'bg-amber-500 text-neutral-950 font-semibold',
      };
    case 'want_to_see':
      return {
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-300',
        border: 'border-emerald-500/40',
        solidBg: 'bg-emerald-500 text-neutral-950 font-semibold',
      };
    case 'maybe':
      return {
        bg: 'bg-sky-500/15',
        text: 'text-sky-300',
        border: 'border-sky-500/40',
        solidBg: 'bg-sky-500 text-neutral-950 font-semibold',
      };
    default:
      return {
        bg: 'bg-neutral-800/40',
        text: 'text-neutral-400',
        border: 'border-neutral-700',
        solidBg: 'bg-neutral-700 text-neutral-300',
      };
  }
}

/**
 * Detect all clashes among a user's selected acts for a given day (or all days)
 */
export function detectClashes(
  userPreferences: Record<string, UserActPreference | PriorityLevel>,
  dayFilter?: FestivalDay,
  includeMaybe: boolean = true
): ClashDetail[] {
  const selectedActs: Act[] = [];

  // Filter acts that user has prioritized (must_see, want_to_see, maybe)
  FESTIVAL_ACTS.forEach((act) => {
    if (dayFilter && act.day !== dayFilter) return;

    const pref = userPreferences[act.id];
    const priority = typeof pref === 'string' ? pref : pref?.priority;

    if (
      priority === 'must_see' ||
      priority === 'want_to_see' ||
      (includeMaybe && priority === 'maybe')
    ) {
      selectedActs.push(act);
    }
  });

  const clashes: ClashDetail[] = [];
  const processedPairs = new Set<string>();

  for (let i = 0; i < selectedActs.length; i++) {
    for (let j = i + 1; j < selectedActs.length; j++) {
      const act1 = selectedActs[i];
      const act2 = selectedActs[j];

      // Must be on same day
      if (act1.day !== act2.day) continue;

      const pairKey = [act1.id, act2.id].sort().join('_');
      if (processedPairs.has(pairKey)) continue;

      // Check overlap in time
      const maxStart = Math.max(act1.startMinutes, act2.startMinutes);
      const minEnd = Math.min(act1.endMinutes, act2.endMinutes);

      if (maxStart < minEnd) {
        const overlap = minEnd - maxStart;
        const walking = getWalkingTime(act1.stageId, act2.stageId).minutes;

        let severity: 'full' | 'major' | 'minor' = 'minor';
        if (
          (act1.startMinutes === act2.startMinutes && act1.endMinutes === act2.endMinutes) ||
          overlap >= 45
        ) {
          severity = 'full';
        } else if (overlap >= 25) {
          severity = 'major';
        }

        clashes.push({
          id: pairKey,
          act1,
          act2,
          overlapStartMinutes: maxStart,
          overlapEndMinutes: minEnd,
          overlapDurationMinutes: overlap,
          severity,
          walkingTimeMinutes: walking,
        });

        processedPairs.add(pairKey);
      }
    }
  }

  // Sort by start time of clash
  return clashes.sort((a, b) => a.overlapStartMinutes - b.overlapStartMinutes);
}

/**
 * Check if a specific act is currently in a clash with any other favorited act
 */
export function getActClashes(
  actId: string,
  allClashes: ClashDetail[]
): ClashDetail[] {
  return allClashes.filter((c) => c.act1.id === actId || c.act2.id === actId);
}

/**
 * Generate iCalendar (ICS) string for all saved acts
 */
export function generateICS(
  userPreferences: Record<string, UserActPreference | PriorityLevel>
): string {
  const selectedActs = FESTIVAL_ACTS.filter((act) => {
    const pref = userPreferences[act.id];
    const priority = typeof pref === 'string' ? pref : pref?.priority;
    return priority && priority !== 'none';
  });

  if (selectedActs.length === 0) return '';

  const dayToDateMap: Record<FestivalDay, string> = {
    thursday: '20260827',
    friday: '20260828',
    saturday: '20260829',
    sunday: '20260830',
  };

  const dayToNextDayMap: Record<FestivalDay, string> = {
    thursday: '20260828',
    friday: '20260829',
    saturday: '20260830',
    sunday: '20260831',
  };

  let icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Electric Picnic Schedule Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:My Electric Picnic 2026 Schedule',
    'X-WR-TIMEZONE:Europe/Dublin',
  ];

  selectedActs.forEach((act) => {
    const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
    const stageName = stage?.name || 'Stradbally Hall';
    const pref = userPreferences[act.id];
    const priority = typeof pref === 'string' ? pref : pref?.priority || 'none';
    const notes = typeof pref === 'object' ? pref?.notes : '';

    const [startH, startM] = act.startTime.split(':').map(Number);
    const [endH, endM] = act.endTime.split(':').map(Number);

    const startDateStr = startH < 6 ? dayToNextDayMap[act.day] : dayToDateMap[act.day];
    const endDateStr = endH < 6 ? dayToNextDayMap[act.day] : dayToDateMap[act.day];

    const dtStart = `${startDateStr}T${startH.toString().padStart(2, '0')}${startM.toString().padStart(2, '0')}00`;
    const dtEnd = `${endDateStr}T${endH.toString().padStart(2, '0')}${endM.toString().padStart(2, '0')}00`;

    const summary = `${act.name} [${getPriorityLabel(priority)}]`;
    const description = `Electric Picnic 2026\\nStage: ${stageName}\\nGenre: ${act.genre}\\n${act.description}${notes ? `\\n\\nMy Notes: ${notes}` : ''}`;

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:ep2026-${act.id}@electricpicnicplanner`,
      `DTSTAMP:${dayToDateMap[act.day]}T120000Z`,
      `DTSTART;TZID=Europe/Dublin:${dtStart}`,
      `DTEND;TZID=Europe/Dublin:${dtEnd}`,
      `SUMMARY:${summary}`,
      `LOCATION:${stageName}, Stradbally Hall, Co. Laois, Ireland`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${act.name} starts in 15 mins at ${stageName}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

/**
 * Format clean markdown / text itinerary for copying to clipboard
 */
export function formatItineraryText(
  userPreferences: Record<string, UserActPreference | PriorityLevel>
): string {
  const days: FestivalDay[] = ['thursday', 'friday', 'saturday', 'sunday'];
  const dayNames: Record<FestivalDay, string> = {
    thursday: 'THURSDAY, AUGUST 27, 2026',
    friday: 'FRIDAY, AUGUST 28, 2026',
    saturday: 'SATURDAY, AUGUST 29, 2026',
    sunday: 'SUNDAY, AUGUST 30, 2026',
  };

  let result = '🎪 MY ELECTRIC PICNIC 2026 FESTIVAL PLAN 🎪\n\n';

  days.forEach((day) => {
    const dayActs = FESTIVAL_ACTS.filter((act) => {
      if (act.day !== day) return false;
      const pref = userPreferences[act.id];
      const priority = typeof pref === 'string' ? pref : pref?.priority;
      return priority && priority !== 'none';
    }).sort((a, b) => a.startMinutes - b.startMinutes);

    if (dayActs.length > 0) {
      result += `📅 ${dayNames[day]}\n`;
      result += '----------------------------------------\n';
      dayActs.forEach((act) => {
        const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
        const pref = userPreferences[act.id];
        const priority = typeof pref === 'string' ? pref : pref?.priority || 'none';
        const priorityIcon = priority === 'must_see' ? '🔥' : priority === 'want_to_see' ? '⭐' : '👀';
        const notes = typeof pref === 'object' && pref?.notes ? ` (Note: ${pref.notes})` : '';

        result += `${priorityIcon} ${act.displayTime.padEnd(20)} | ${act.name.padEnd(22)} @ ${stage?.shortName || ''}${notes}\n`;
      });
      result += '\n';
    }
  });

  result += 'Plan created with Electric Picnic Schedule & Clash Planner 🎸⚡';
  return result;
}
