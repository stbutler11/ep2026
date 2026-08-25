import React from 'react';
import { Act, ClashDetail, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { FESTIVAL_ACTS, FESTIVAL_STAGES, getWalkingTime } from '../data/festivalData';
import { getActClashes } from '../utils/scheduleUtils';

export interface PrintSettings {
  format: 'pocket_pass' | 'timeline_poster' | 'stage_grid';
  colorMode: 'vibrant' | 'eco';
  density: 'spacious' | 'standard' | 'compact';
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
    format,
    colorMode,
    density = 'standard',
    dayScope,
    attendeeName,
    showNotes,
    showWalkingTimes,
    showFestivalEssentials,
    showClashes,
    pageBreaks = 'per_day',
  } = settings;

  const isEco = colorMode === 'eco';
  const isCompact = density === 'compact';
  const isSpacious = density === 'spacious';

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

  return (
    <div
      id={id}
      className={`print-document-root ${
        isEco ? 'bg-white text-neutral-900' : 'bg-neutral-950 text-white'
      } font-sans ${isCompact ? 'p-4 sm:p-5' : isSpacious ? 'p-8 sm:p-10' : 'p-6 sm:p-8'} max-w-4xl mx-auto ${
        isPdfPreview ? 'shadow-2xl rounded-2xl border border-neutral-800' : ''
      }`}
      style={{
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* Festival Header Banner */}
      <div
        className={`rounded-2xl relative overflow-hidden border ${
          isCompact ? 'p-4 mb-4' : 'p-5 sm:p-6 mb-6'
        } ${
          isEco
            ? 'bg-neutral-100 border-neutral-300 text-neutral-950'
            : 'bg-linear-to-r from-amber-600 via-rose-600 to-purple-800 border-amber-400/40 text-white shadow-lg'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  isEco
                    ? 'bg-neutral-900 text-white'
                    : 'bg-black/40 text-amber-300 border border-amber-300/40'
                }`}
              >
                Official Festival Schedule
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
                isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'
              } font-extrabold tracking-tight uppercase`}
            >
              Electric Picnic <span className={isEco ? 'text-amber-600' : 'text-amber-300'}>'26</span>
            </h1>
            <p className={`text-[11px] sm:text-xs font-medium mt-0.5 ${isEco ? 'text-neutral-700' : 'text-amber-100'}`}>
              📍 Stradbally Hall, Co. Laois, Ireland • Main Arena & Late Night Districts
            </p>
          </div>

          {/* Attendee / Pass Badge */}
          <div
            className={`p-3 rounded-xl border text-right sm:text-left shrink-0 ${
              isEco
                ? 'bg-white border-neutral-300 text-neutral-900 shadow-xs'
                : 'bg-black/40 backdrop-blur-md border-white/20 text-white'
            }`}
          >
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
              Personalized Festival Pass
            </div>
            <div className="text-xs sm:text-sm font-extrabold truncate max-w-[200px] text-amber-600 dark:text-amber-300">
              {attendeeName.trim() ? attendeeName : 'Festival Crew Pass'}
            </div>
            <div className="flex items-center gap-2 text-[10px] mt-1 font-semibold">
              <span className={isEco ? 'text-neutral-900 font-bold' : 'text-amber-300'}>
                ★ {totalActCount} Acts Saved
              </span>
              <span>•</span>
              <span className={isEco ? 'text-neutral-900 font-bold' : 'text-emerald-300'}>
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
          <div className="text-base font-bold mb-1">No Acts Selected for Printout</div>
          <p className="text-xs max-w-md mx-auto">
            Please shortlist your favorite acts by marking them as <strong>Must See</strong>,{' '}
            <strong>Want to See</strong>, or <strong>Maybe</strong> in the Timetable or Lineup Explorer before printing.
          </p>
        </div>
      )}

      {/* Main Schedule Content by Day */}
      <div className={isCompact ? 'space-y-4' : 'space-y-6'}>
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
                className={`flex items-center justify-between rounded-xl border mb-2.5 ${
                  isCompact ? 'py-1.5 px-3' : 'py-2 px-4'
                } ${
                  isEco
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-950 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-amber-300 font-bold'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`${isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} uppercase tracking-wide`}>
                    {meta.date}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
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

              {/* Layout Formats */}
              {format === 'pocket_pass' ? (
                /* ============= POCKET PASS 2-COLUMN BOOKLET FORMAT ============= */
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompact ? 'gap-2' : 'gap-3'}`}>
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
                          isCompact ? 'p-2.5' : 'p-3'
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
                              className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                                isEco
                                  ? 'bg-neutral-900 text-white'
                                  : 'bg-amber-500 text-neutral-950'
                              }`}
                            >
                              {act.displayTime}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border truncate"
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
                          <div className="flex items-center gap-1.5 mt-1">
                            <h3
                              className={`${
                                isCompact ? 'text-xs sm:text-sm font-extrabold' : 'text-sm sm:text-base font-extrabold'
                              } leading-snug truncate ${isEco ? 'text-neutral-950' : 'text-white'}`}
                            >
                              {act.name}
                            </h3>
                            {act.isHeadliner && (
                              <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-500 text-neutral-950 shrink-0">
                                ★ Headliner
                              </span>
                            )}
                            {act.isIrish && (
                              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                                ☘️
                              </span>
                            )}
                          </div>

                          {/* Priority & Genre */}
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
                            <span className="font-semibold capitalize">
                              {priority === 'must_see' && '🔥 Must See'}
                              {priority === 'want_to_see' && '★ Want to See'}
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
                              className={`mt-1.5 p-1.5 rounded text-[10px] italic border ${
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
                              className={`mt-1.5 p-1.5 rounded-lg text-[10px] flex flex-col gap-0.5 border ${
                                isEco
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : 'bg-rose-950/50 border-rose-500/30 text-rose-200'
                              }`}
                            >
                              <div className="font-bold flex items-center gap-1 text-[9px] uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                ⚠️ Stage Clash Alert:
                              </div>
                              {actClashes.map((c) => {
                                const otherAct = c.act1.id === act.id ? c.act2 : c.act1;
                                const otherStage = FESTIVAL_STAGES.find((s) => s.id === otherAct.stageId);
                                return (
                                  <div key={c.id} className="flex items-center justify-between text-[9px] font-semibold">
                                    <span className="truncate">
                                      vs. <strong className="underline">{otherAct.name}</strong> ({otherStage?.shortName})
                                    </span>
                                    <span className="text-rose-500 font-bold shrink-0 ml-1">
                                      {c.overlapDurationMinutes}m overlap
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
                            className={`mt-2 pt-1 border-t text-[9px] flex items-center justify-between font-semibold ${
                              isEco
                                ? 'border-neutral-200 text-neutral-600'
                                : 'border-neutral-800 text-neutral-400'
                            }`}
                          >
                            <span className="truncate">Next: {nextAct.name}</span>
                            <span className="text-amber-500 font-bold shrink-0 ml-1">🚶 {walk.minutes}m walk</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ============= TIMELINE POSTER / DETAILED CHRONOLOGICAL FORMAT ============= */
                <div className={isCompact ? 'space-y-1.5' : 'space-y-2.5'}>
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
                        className={`rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 break-inside-avoid ${
                          isCompact ? 'p-2 sm:p-2.5' : 'p-3 sm:p-4'
                        } ${
                          isEco
                            ? 'bg-white border-neutral-300 shadow-xs'
                            : 'bg-neutral-900/90 border-neutral-800'
                        }`}
                      >
                        {/* Time & Stage badge */}
                        <div className="flex items-center gap-2 sm:w-52 shrink-0">
                          <div
                            className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                              isEco
                                ? 'bg-neutral-900 text-white'
                                : 'bg-amber-500 text-neutral-950 shadow-xs'
                            }`}
                          >
                            {act.displayTime}
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border truncate"
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
                                isCompact ? 'text-xs sm:text-sm font-extrabold' : 'text-sm sm:text-base font-extrabold'
                              } truncate ${isEco ? 'text-neutral-950' : 'text-white'}`}
                            >
                              {act.name}
                            </h3>
                            {act.isHeadliner && (
                              <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-500 text-neutral-950 shrink-0">
                                Headliner
                              </span>
                            )}
                            {act.isIrish && (
                              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                                Irish ☘️
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
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
                              className={`mt-1 p-1.5 rounded text-[10px] italic border ${
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
                              className={`mt-1 p-1.5 rounded text-[9px] font-semibold flex flex-col gap-0.5 border ${
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
                                    Clashes with <strong>{otherAct.name}</strong> ({otherStage?.shortName}) — {c.overlapDurationMinutes}m overlap
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Walking Next info */}
                        {showWalkingTimes && walk && nextAct.stageId !== act.stageId && (
                          <div
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border sm:text-right shrink-0 ${
                              isEco
                                ? 'bg-neutral-100 border-neutral-300 text-neutral-700'
                                : 'bg-neutral-950 border-neutral-800 text-amber-400'
                            }`}
                          >
                            🚶 {walk.minutes}m walk to {nextAct.stageId === 'main_stage' ? 'Main Stage' : nextAct.name}
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

      {/* Walking Times Cheat Sheet & Map Summary */}
      {showWalkingTimes && (
        <div
          className={`mt-6 rounded-xl border page-break-inside-avoid break-inside-avoid ${
            isCompact ? 'p-3' : 'p-4'
          } ${isEco ? 'bg-neutral-100 border-neutral-300 text-neutral-900' : 'bg-neutral-900/80 border-neutral-800'}`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              🚶 Stradbally Walking Distance Reference
            </h4>
            <span className="text-[9px] text-neutral-500">Average pace across Stradbally grounds</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
            <div className={`p-1.5 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Main → Electric Arena</span>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">~6 mins (380m)</div>
            </div>
            <div className={`p-1.5 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Main → Rankin's Wood</span>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">~8 mins (520m)</div>
            </div>
            <div className={`p-1.5 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Main → Terminus / Rave</span>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">~12 mins (750m)</div>
            </div>
            <div className={`p-1.5 rounded border ${isEco ? 'bg-white border-neutral-300' : 'bg-neutral-950/50 border-neutral-700/30'}`}>
              <span className="font-bold">Arena → Rankin's Wood</span>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">~5 mins (320m)</div>
            </div>
          </div>
        </div>
      )}

      {/* Festival Essentials & Key Notes */}
      {showFestivalEssentials && (
        <div
          className={`mt-3 rounded-xl border text-[10px] page-break-inside-avoid break-inside-avoid ${
            isCompact ? 'p-2.5' : 'p-3.5'
          } ${isEco ? 'bg-neutral-100 border-neutral-300 text-neutral-900' : 'bg-neutral-900/60 border-neutral-800'}`}
        >
          <div className="font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            ⚡ Festival Essentials &amp; Safety Tips
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-neutral-600 dark:text-neutral-400 mt-1.5">
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-200">💧 Water &amp; Hydration:</span>
              <p>Free water refill taps located at all main arena toilets &amp; campsite hubs.</p>
            </div>
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-200">🌳 Meeting Point:</span>
              <p>Pick a landmark (e.g. Stradbally Ferris Wheel) for rendezvous if phone signal drops.</p>
            </div>
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-200">🌙 Late Night Hubs:</span>
              <p>Terminus, Anachronica (Rave in the Woods), and Trenchtown run until 04:00 AM+.</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-6 pt-3 border-t border-neutral-300 dark:border-neutral-800/80 flex items-center justify-between text-[9px] text-neutral-500">
        <div>Electric Picnic '26 • Stradbally Hall, Co. Laois • August 27–30, 2026</div>
        <div>Printed with Electric Picnic Festival Planner</div>
      </div>
    </div>
  );
};
