import React from 'react';
import { Act, ClashDetail, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { FESTIVAL_ACTS, FESTIVAL_STAGES, getWalkingTime } from '../data/festivalData';
import { getActClashes } from '../utils/scheduleUtils';

export interface PrintSettings {
  format: 'pocket_pass' | 'timeline_poster' | 'days_columns';
  columns: 1 | 2 | 3 | 4;
  colorMode: 'vibrant' | 'eco';
  density: 'spacious' | 'standard' | 'compact' | 'ultra_compact';
  dayScope: FestivalDay | 'all';
  attendeeName: string;
  showNotes: boolean;
  showWalkingTimes: boolean;
  showFestivalEssentials: boolean;
  showClashes: boolean;
  pageBreaks: 'per_day' | 'continuous';
}

interface PrintableItineraryDocumentProps {
  settings: PrintSettings;
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  clashes: ClashDetail[];
  id?: string;
  isPdfPreview?: boolean;
}

const DAY_LABELS: Record<FestivalDay, { name: string; date: string; shortDate: string }> = {
  thursday: { name: 'Thursday', date: 'Thursday, August 27, 2026', shortDate: 'Thu Aug 27' },
  friday: { name: 'Friday', date: 'Friday, August 28, 2026', shortDate: 'Fri Aug 28' },
  saturday: { name: 'Saturday', date: 'Saturday, August 29, 2026', shortDate: 'Sat Aug 29' },
  sunday: { name: 'Sunday', date: 'Sunday, August 30, 2026', shortDate: 'Sun Aug 30' },
};

const FESTIVAL_DAYS_ORDER: FestivalDay[] = ['thursday', 'friday', 'saturday', 'sunday'];

export const PrintableItineraryDocument: React.FC<PrintableItineraryDocumentProps> = ({
  settings,
  userPreferences,
  clashes,
  id = 'festival-print-document',
  isPdfPreview = false,
}) => {
  const {
    format = 'pocket_pass',
    columns = 3,
    colorMode = 'vibrant',
    density = 'compact',
    dayScope = 'all',
    attendeeName,
    showNotes = true,
    showWalkingTimes = true,
    showFestivalEssentials = true,
    showClashes = true,
    pageBreaks = 'per_day',
  } = settings;

  const isEco = colorMode === 'eco';
  const isUltraCompact = density === 'ultra_compact';
  const isCompact = density === 'compact' || isUltraCompact;
  const isSpacious = density === 'spacious';

  // Calculate actual column count based on format and column choice
  const actualCols = format === 'timeline_poster' ? 1 : columns || (isUltraCompact ? 3 : 2);

  // Extract all shortlisted acts for the scope
  const shortlistedActs = React.useMemo(() => {
    return FESTIVAL_ACTS.filter((act) => {
      if (dayScope !== 'all' && act.day !== dayScope) return false;
      const pref = userPreferences[act.id];
      const priority = typeof pref === 'string' ? pref : pref?.priority;
      return priority && priority !== 'none';
    });
  }, [userPreferences, dayScope]);

  // Group acts by day
  const actsByDay = React.useMemo(() => {
    const days = dayScope === 'all' ? FESTIVAL_DAYS_ORDER : [dayScope];
    return days.map((d) => {
      const dayActs = shortlistedActs
        .filter((a) => a.day === d)
        .sort((a, b) => a.startMinutes - b.startMinutes);
      return {
        day: d,
        meta: DAY_LABELS[d],
        acts: dayActs,
      };
    });
  }, [shortlistedActs, dayScope]);

  const totalActCount = shortlistedActs.length;
  const mustSeeCount = shortlistedActs.filter((a) => {
    const pref = userPreferences[a.id];
    const priority = typeof pref === 'string' ? pref : pref?.priority;
    return priority === 'must_see';
  }).length;

  // For the Days Board format: if no acts are selected for Thursday, make it a 3-day board (Fri, Sat, Sun)
  const boardDays = React.useMemo(() => {
    const thuActsCount = actsByDay.find((d) => d.day === 'thursday')?.acts.length || 0;
    if (thuActsCount === 0) {
      // Omit Thursday so Friday, Saturday, and Sunday fill the 3 columns cleanly
      return actsByDay.filter((d) => d.day !== 'thursday');
    }
    return actsByDay;
  }, [actsByDay]);

  const activeBoardCols = Math.max(1, boardDays.length);

  // Determine container width for crisp multi-column rendering
  const minContainerWidth =
    format === 'days_columns' && dayScope === 'all'
      ? activeBoardCols === 4
        ? 'min-w-[960px] w-[960px]'
        : activeBoardCols === 3
        ? 'min-w-[880px] w-[880px]'
        : 'min-w-[720px] w-[720px]'
      : actualCols === 3
      ? 'min-w-[880px] w-[880px]'
      : actualCols === 2
      ? 'min-w-[720px] w-[720px]'
      : 'w-full max-w-4xl';

  return (
    <div
      id={id}
      className={`print-document-root ${
        isEco ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-white'
      } font-sans ${
        isUltraCompact
          ? 'p-3.5'
          : isCompact
          ? 'p-4 sm:p-5'
          : isSpacious
          ? 'p-8'
          : 'p-6'
      } mx-auto ${minContainerWidth} ${
        isPdfPreview ? 'shadow-2xl rounded-2xl border border-neutral-800' : ''
      }`}
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        boxSizing: 'border-box',
      }}
    >
      {/* Festival Header Banner */}
      <div
        className={`rounded-2xl relative overflow-hidden border ${
          isUltraCompact ? 'p-3 mb-3' : isCompact ? 'p-3.5 mb-3.5' : 'p-5 mb-5'
        } ${
          isEco
            ? 'bg-neutral-100 border-neutral-300 text-neutral-950'
            : 'bg-linear-to-r from-amber-600 via-rose-600 to-purple-800 border-amber-400/40 text-white shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  isEco
                    ? 'bg-neutral-900 text-white'
                    : 'bg-black/40 text-amber-300 border border-amber-300/40'
                }`}
              >
                EP '26 Lineup Guide
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isEco ? 'bg-neutral-200 text-neutral-800 border border-neutral-300' : 'bg-white/20 text-white'
                }`}
              >
                August 27 – 30, 2026
              </span>
            </div>
            <h1
              className={`${
                isUltraCompact ? 'text-lg' : isCompact ? 'text-xl' : 'text-2xl'
              } font-black tracking-tight uppercase`}
            >
              Electric Picnic <span className={isEco ? 'text-amber-600' : 'text-amber-300'}>'26</span>
            </h1>
            <p className={`text-[10.5px] font-medium mt-0.5 ${isEco ? 'text-neutral-700' : 'text-amber-100'}`}>
              📍 Stradbally Hall, Co. Laois • Main Arena &amp; Late Night Districts
            </p>
          </div>

          {/* Attendee / Pass Badge */}
          <div
            className={`p-2.5 rounded-xl border text-right shrink-0 ${
              isEco
                ? 'bg-white border-neutral-300 text-neutral-900 shadow-xs'
                : 'bg-black/40 backdrop-blur-md border-white/20 text-white'
            }`}
          >
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
              Personalized Pass
            </div>
            <div className="text-xs font-black truncate max-w-[220px] text-amber-600 dark:text-amber-300">
              {attendeeName.trim() ? attendeeName : 'Festival Crew Pass'}
            </div>
            <div className="flex items-center justify-end gap-2 text-[10px] mt-0.5 font-bold">
              <span className={isEco ? 'text-neutral-900' : 'text-amber-300'}>
                ★ {totalActCount} Acts
              </span>
              <span>•</span>
              <span className={isEco ? 'text-neutral-900' : 'text-emerald-300'}>
                🔥 {mustSeeCount} Must-See
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Warning if no acts selected */}
      {totalActCount === 0 && (
        <div
          className={`p-8 rounded-2xl border text-center my-6 ${
            isEco
              ? 'bg-neutral-50 border-neutral-300 text-neutral-700'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300'
          }`}
        >
          <div className="text-base font-bold mb-1">No Acts Selected for Export</div>
          <p className="text-xs max-w-md mx-auto">
            Please shortlist your favorite acts by marking them as <strong>Must See</strong>,{' '}
            <strong>Want to See</strong>, or <strong>Maybe</strong> in the Timetable or Lineup Explorer before exporting.
          </p>
        </div>
      )}

      {/* ============= DAYS SIDE-BY-SIDE BOARD FORMAT (3 or 4 Days) ============= */}
      {format === 'days_columns' && dayScope === 'all' ? (
        <div
          className="grid gap-2.5 mb-4"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${activeBoardCols}, minmax(0, 1fr))`,
            alignItems: 'start',
          }}
        >
          {boardDays.map(({ day, meta, acts }) => (
            <div
              key={day}
              className={`rounded-2xl border flex flex-col p-2.5 ${
                isEco ? 'bg-neutral-50 border-neutral-300' : 'bg-neutral-900/70 border-neutral-800'
              }`}
            >
              {/* Day Header */}
              <div
                className={`flex items-center justify-between p-2 rounded-xl mb-2 font-bold ${
                  isEco ? 'bg-neutral-200 text-neutral-900' : 'bg-neutral-800 text-amber-300'
                }`}
              >
                <div className="text-[11px] uppercase tracking-wide truncate">{meta.shortDate}</div>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-neutral-950 font-black shrink-0">
                  {acts.length}
                </span>
              </div>

              {/* Acts List for this day */}
              <div className="space-y-1.5 flex-1">
                {acts.length === 0 ? (
                  <div className="text-[10px] text-neutral-500 italic p-3 text-center">
                    No acts saved
                  </div>
                ) : (
                  acts.map((act) => {
                    const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
                    const pref = userPreferences[act.id];
                    const priority = typeof pref === 'string' ? pref : pref?.priority;
                    const notes = typeof pref === 'object' ? pref?.notes : '';
                    const actClashes = getActClashes(act.id, clashes);

                    return (
                      <div
                        key={act.id}
                        className={`rounded-xl border p-2 flex flex-col justify-between ${
                          isEco
                            ? 'bg-white border-neutral-300 shadow-xs'
                            : 'bg-neutral-950/90 border-neutral-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9.5px] font-black px-1.5 py-0.2 rounded ${
                                isEco ? 'bg-neutral-900 text-white' : 'bg-amber-500 text-neutral-950'
                              }`}
                            >
                              {act.displayTime}
                            </span>
                            <span
                              className="text-[8.5px] font-bold px-1 py-0.2 rounded border truncate max-w-[80px]"
                              style={{
                                backgroundColor: isEco ? '#f5f5f5' : `${stage?.color}20`,
                                color: isEco ? '#171717' : stage?.color,
                                borderColor: isEco ? '#d4d4d4' : `${stage?.color}50`,
                              }}
                            >
                              {stage?.shortName}
                            </span>
                          </div>

                          <div className="font-extrabold text-[11px] leading-tight truncate text-white dark:text-white">
                            {act.name}
                          </div>

                          <div className="flex items-center gap-1 text-[8.5px] text-neutral-400 mt-0.5">
                            <span>
                              {priority === 'must_see' && '🔥 Must'}
                              {priority === 'want_to_see' && '★ Want'}
                              {priority === 'maybe' && '👁️ Maybe'}
                            </span>
                            <span>•</span>
                            <span className="truncate">{act.genre}</span>
                          </div>

                          {showNotes && notes && (
                            <div className="mt-1 p-1 rounded text-[8px] italic bg-amber-950/40 text-amber-200 border border-amber-500/20">
                              "{notes}"
                            </div>
                          )}

                          {showClashes && actClashes.length > 0 && (
                            <div className="mt-1 p-1 rounded text-[8px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30">
                              ⚠️ Clash ({actClashes.length})
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ============= DAY-BY-DAY SCHEDULE CONTENT ============= */
        <div className={isUltraCompact ? 'space-y-3' : isCompact ? 'space-y-3.5' : 'space-y-5'}>
          {actsByDay.map(({ day, meta, acts }, dayIdx) => {
            if (acts.length === 0) return null;

            const shouldBreakBefore = pageBreaks === 'per_day' && dayIdx > 0;

            return (
              <div
                key={day}
                className={`page-break-inside-avoid break-inside-avoid ${
                  shouldBreakBefore ? 'print-page-break-before' : ''
                }`}
              >
                {/* Day Header Bar */}
                <div
                  className={`flex items-center justify-between rounded-xl border mb-2 ${
                    isUltraCompact ? 'py-1 px-2.5' : isCompact ? 'py-1.5 px-3' : 'py-2 px-4'
                  } ${
                    isEco
                      ? 'bg-neutral-100 border-neutral-300 text-neutral-950 font-bold'
                      : 'bg-neutral-900 border-neutral-800 text-amber-300 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`${
                        isUltraCompact ? 'text-xs' : isCompact ? 'text-xs' : 'text-sm'
                      } uppercase tracking-wide`}
                    >
                      {meta.date}
                    </span>
                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-black ${
                        isEco ? 'bg-neutral-900 text-white' : 'bg-amber-500 text-neutral-950'
                      }`}
                    >
                      {acts.length} Acts
                    </span>
                  </div>
                  <div className="text-[10px] font-semibold text-neutral-500">
                    Electric Picnic '26
                  </div>
                </div>

                {/* Multi-Column Grid Layout with Strict Grid Template Columns */}
                {format === 'pocket_pass' ? (
                  <div
                    className="grid gap-2"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${actualCols}, minmax(0, 1fr))`,
                      gap: isUltraCompact ? '6px' : isCompact ? '8px' : '10px',
                    }}
                  >
                    {acts.map((act, idx) => {
                      const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
                      const pref = userPreferences[act.id];
                      const priority = typeof pref === 'string' ? pref : pref?.priority;
                      const notes = typeof pref === 'object' ? pref?.notes : '';
                      const actClashes = getActClashes(act.id, clashes);
                      const nextAct = acts[idx + 1];
                      const walk = nextAct ? getWalkingTime(act.stageId, nextAct.stageId) : null;

                      return (
                        <div
                          key={act.id}
                          className={`rounded-xl border flex flex-col justify-between break-inside-avoid ${
                            isUltraCompact ? 'p-2' : isCompact ? 'p-2.5' : 'p-3'
                          } ${
                            isEco
                              ? 'bg-white border-neutral-300 shadow-xs'
                              : 'bg-neutral-900/90 border-neutral-800 shadow-md'
                          }`}
                        >
                          <div>
                            {/* Top Meta Line: Time & Stage */}
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md ${
                                  isEco ? 'bg-neutral-900 text-white' : 'bg-amber-500 text-neutral-950'
                                }`}
                              >
                                {act.displayTime}
                              </span>
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border truncate max-w-[110px]"
                                style={{
                                  backgroundColor: isEco ? '#f5f5f5' : `${stage?.color}20`,
                                  color: isEco ? '#171717' : stage?.color,
                                  borderColor: isEco ? '#d4d4d4' : `${stage?.color}50`,
                                }}
                              >
                                {stage?.shortName}
                              </span>
                            </div>

                            {/* Act Title */}
                            <div className="flex items-center gap-1 mt-0.5">
                              <h3
                                className={`${
                                  isUltraCompact ? 'text-[11.5px] font-bold' : isCompact ? 'text-xs font-extrabold' : 'text-sm font-extrabold'
                                } leading-snug truncate ${isEco ? 'text-neutral-950' : 'text-white'}`}
                              >
                                {act.name}
                              </h3>
                              {act.isHeadliner && (
                                <span className="text-[7px] font-black uppercase px-1 py-0.2 rounded bg-amber-500 text-neutral-950 shrink-0">
                                  ★ HL
                                </span>
                              )}
                              {act.isIrish && (
                                <span className="text-[7px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                                  ☘️
                                </span>
                              )}
                            </div>

                            {/* Priority & Genre */}
                            <div className="flex items-center gap-1 text-[9px] text-neutral-500 mt-0.5">
                              <span className="font-bold">
                                {priority === 'must_see' && '🔥 Must'}
                                {priority === 'want_to_see' && '★ Want'}
                                {priority === 'maybe' && '👁️ Maybe'}
                              </span>
                              <span>•</span>
                              <span className="truncate">{act.genre}</span>
                              <span>•</span>
                              <span>{act.durationMinutes}m</span>
                            </div>

                            {/* Personal Notes if enabled */}
                            {showNotes && notes && (
                              <div
                                className={`mt-1 p-1 rounded text-[8.5px] italic border ${
                                  isEco
                                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                                    : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                                }`}
                              >
                                📝 "{notes}"
                              </div>
                            )}

                            {/* Explicit Clash Indicator naming the clashing acts */}
                            {showClashes && actClashes.length > 0 && (
                              <div
                                className={`mt-1 p-1 rounded-lg text-[8.5px] flex flex-col gap-0.5 border ${
                                  isEco
                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                    : 'bg-rose-950/50 border-rose-500/30 text-rose-200'
                                }`}
                              >
                                <div className="font-black flex items-center gap-1 text-[8px] uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                  ⚠️ Clash:
                                </div>
                                {actClashes.map((c) => {
                                  const otherAct = c.act1.id === act.id ? c.act2 : c.act1;
                                  const otherStage = FESTIVAL_STAGES.find((s) => s.id === otherAct.stageId);
                                  return (
                                    <div key={c.id} className="flex items-center justify-between text-[8px] font-semibold">
                                      <span className="truncate">
                                        vs. <strong>{otherAct.name}</strong> ({otherStage?.shortName})
                                      </span>
                                      <span className="text-rose-400 font-bold shrink-0 ml-1">
                                        {c.overlapDurationMinutes}m
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Walking Transition to Next Stage */}
                          {showWalkingTimes && walk && nextAct.stageId !== act.stageId && (
                            <div
                              className={`mt-1.5 pt-1 border-t text-[8px] flex items-center justify-between font-semibold ${
                                isEco
                                  ? 'border-neutral-200 text-neutral-600'
                                  : 'border-neutral-800 text-neutral-400'
                              }`}
                            >
                              <span className="truncate">Next: {nextAct.name}</span>
                              <span className="text-amber-500 font-bold shrink-0 ml-1">🚶 {walk.minutes}m</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ============= TIMELINE POSTER (1-COLUMN FULL ROWS) ============= */
                  <div className={isUltraCompact ? 'space-y-1' : isCompact ? 'space-y-1.5' : 'space-y-2'}>
                    {acts.map((act, idx) => {
                      const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
                      const pref = userPreferences[act.id];
                      const priority = typeof pref === 'string' ? pref : pref?.priority;
                      const notes = typeof pref === 'object' ? pref?.notes : '';
                      const actClashes = getActClashes(act.id, clashes);
                      const nextAct = acts[idx + 1];
                      const walk = nextAct ? getWalkingTime(act.stageId, nextAct.stageId) : null;

                      return (
                        <div
                          key={act.id}
                          className={`rounded-xl border flex items-center justify-between gap-2.5 break-inside-avoid ${
                            isUltraCompact ? 'p-1.5 px-2.5' : isCompact ? 'p-2 px-3' : 'p-3 px-4'
                          } ${
                            isEco
                              ? 'bg-white border-neutral-300 shadow-xs'
                              : 'bg-neutral-900/90 border-neutral-800'
                          }`}
                        >
                          {/* Time & Stage badge */}
                          <div className="flex items-center gap-1.5 w-44 shrink-0">
                            <div
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${
                                isEco ? 'bg-neutral-900 text-white' : 'bg-amber-500 text-neutral-950 shadow-xs'
                              }`}
                            >
                              {act.displayTime}
                            </div>
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border truncate"
                              style={{
                                backgroundColor: isEco ? '#f5f5f5' : `${stage?.color}20`,
                                color: isEco ? '#171717' : stage?.color,
                                borderColor: isEco ? '#d4d4d4' : `${stage?.color}50`,
                              }}
                            >
                              {stage?.shortName}
                            </span>
                          </div>

                          {/* Artist Info & Notes */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3
                                className={`${
                                  isUltraCompact ? 'text-xs font-bold' : 'text-sm font-extrabold'
                                } truncate ${isEco ? 'text-neutral-950' : 'text-white'}`}
                              >
                                {act.name}
                              </h3>
                              {act.isHeadliner && (
                                <span className="text-[7px] font-black uppercase px-1 py-0.2 rounded bg-amber-500 text-neutral-950 shrink-0">
                                  Headliner
                                </span>
                              )}
                              {act.isIrish && (
                                <span className="text-[7px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                                  Irish ☘️
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-neutral-500 mt-0.5">
                              <span className="font-semibold">
                                {priority === 'must_see' && '🔥 Must See'}
                                {priority === 'want_to_see' && '★ Want to See'}
                                {priority === 'maybe' && '👁️ Maybe'}
                              </span>
                              <span>•</span>
                              <span className="truncate">{act.genre}</span>
                              <span>•</span>
                              <span>{act.durationMinutes} mins</span>
                            </div>

                            {showNotes && notes && (
                              <div
                                className={`mt-1 p-1 rounded text-[8.5px] italic border ${
                                  isEco
                                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                                    : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                                }`}
                              >
                                📝 "{notes}"
                              </div>
                            )}

                            {/* Explicit Clash Details */}
                            {showClashes && actClashes.length > 0 && (
                              <div
                                className={`mt-1 p-1 rounded text-[8px] font-semibold flex flex-col gap-0.5 border ${
                                  isEco
                                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                                    : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                                }`}
                              >
                                <span className="font-bold text-rose-600">⚠️ Clash Alert:</span>
                                {actClashes.map((c) => {
                                  const otherAct = c.act1.id === act.id ? c.act2 : c.act1;
                                  const otherStage = FESTIVAL_STAGES.find((s) => s.id === otherAct.stageId);
                                  return (
                                    <div key={c.id}>
                                      vs. <strong>{otherAct.name}</strong> ({otherStage?.shortName}) — {c.overlapDurationMinutes}m
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Walking Next info */}
                          {showWalkingTimes && walk && nextAct.stageId !== act.stageId && (
                            <div
                              className={`text-[8.5px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                                isEco
                                  ? 'bg-neutral-100 border-neutral-300 text-neutral-700'
                                  : 'bg-neutral-950 border-neutral-800 text-amber-400'
                              }`}
                            >
                              🚶 {walk.minutes}m
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Walking Times Cheat Sheet & Map Summary */}
      {showWalkingTimes && (
        <div
          className={`mt-3.5 rounded-xl border page-break-inside-avoid break-inside-avoid ${
            isUltraCompact ? 'p-2' : isCompact ? 'p-2.5' : 'p-3.5'
          } ${isEco ? 'bg-neutral-100 border-neutral-300 text-neutral-900' : 'bg-neutral-900/80 border-neutral-800'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              🚶 Stradbally Walking Distance Reference
            </h4>
            <span className="text-[8.5px] text-neutral-500">Average pace across grounds</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-[9px]">
            <div className={`p-1 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Main → Arena</span>
              <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">~6m (380m)</div>
            </div>
            <div className={`p-1 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Main → Rankin's</span>
              <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">~8m (520m)</div>
            </div>
            <div className={`p-1 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Main → Terminus</span>
              <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">~12m (750m)</div>
            </div>
            <div className={`p-1 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Arena → Rankin's</span>
              <div className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">~5m (320m)</div>
            </div>
          </div>
        </div>
      )}

      {/* Festival Essentials & Key Notes */}
      {showFestivalEssentials && (
        <div
          className={`mt-2 rounded-xl border text-[9px] page-break-inside-avoid break-inside-avoid ${
            isUltraCompact ? 'p-2' : isCompact ? 'p-2' : 'p-3'
          } ${isEco ? 'bg-neutral-100 border-neutral-300 text-neutral-900' : 'bg-neutral-900/60 border-neutral-800'}`}
        >
          <div className="font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
            ⚡ Festival Essentials &amp; Safety Tips
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[8px] text-neutral-600 dark:text-neutral-400 mt-1">
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-200">💧 Water:</span> Free refill taps at all main arena hubs.
            </div>
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-200">🌳 Meeting Point:</span> Pick a landmark if signal drops.
            </div>
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-200">🌙 Late Night:</span> Terminus runs until 04:00 AM+.
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-3 pt-1.5 border-t border-neutral-300 dark:border-neutral-800/80 flex items-center justify-between text-[8px] text-neutral-500">
        <div>Electric Picnic '26 • Stradbally Hall, Co. Laois • August 27–30, 2026</div>
        <div>Generated with Electric Picnic Schedule Planner</div>
      </div>
    </div>
  );
};
