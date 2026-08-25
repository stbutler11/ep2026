import React, { useState, useMemo, useRef } from 'react';
import {
  Flame,
  Star,
  Eye,
  AlertTriangle,
  Filter,
  Grid,
  List,
  Clock,
  Sparkles,
  ChevronRight,
  Music,
  MapPin,
  X,
} from 'lucide-react';
import { Act, ClashDetail, FestivalDay, PriorityLevel, Stage, UserActPreference } from '../types';
import { FESTIVAL_ACTS, FESTIVAL_STAGES } from '../data/festivalData';
import { getActClashes } from '../utils/scheduleUtils';

interface TimetableGridProps {
  day: FestivalDay;
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  onUpdatePriority: (actId: string, priority: PriorityLevel) => void;
  onOpenActDetail: (act: Act) => void;
  clashes: ClashDetail[];
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  day,
  userPreferences,
  onUpdatePriority,
  onOpenActDetail,
  clashes,
}) => {
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [displayMode, setDisplayMode] = useState<'grid' | 'stream'>('grid');
  const [streamStageFilter, setStreamStageFilter] = useState<string | 'all'>('all');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Pixels per minute scale based on zoom
  const pxPerMinute = zoomLevel === 'compact' ? 1.4 : zoomLevel === 'spacious' ? 2.6 : 1.9;

  // Find min and max minutes for this day's acts
  const dayActs = useMemo(() => {
    return FESTIVAL_ACTS.filter((act) => act.day === day);
  }, [day]);

  const { startMin, endMin } = useMemo(() => {
    if (dayActs.length === 0) return { startMin: 60, endMin: 780 }; // 1:00 PM to 1:00 AM
    let min = Math.min(...dayActs.map((a) => a.startMinutes));
    let max = Math.max(...dayActs.map((a) => a.endMinutes));
    const roundedStart = Math.floor(min / 60) * 60;
    const roundedEnd = Math.ceil(max / 60) * 60;
    return {
      startMin: Math.max(0, roundedStart - 30),
      endMin: Math.max(840, Math.min(1080, roundedEnd + 30)), // dynamically up to 5:00 AM / 6:00 AM
    };
  }, [dayActs]);

  // Generate hour markers
  const hourMarkers = useMemo(() => {
    const markers: { minutes: number; label: string; isMidnight?: boolean; isLateNight?: boolean }[] = [];
    for (let m = startMin; m <= endMin; m += 30) {
      const totalHours = 12 + Math.floor(m / 60);
      const hour24 = totalHours % 24;
      const mins = m % 60;
      const period = totalHours >= 12 && totalHours < 24 ? 'PM' : 'AM';
      let displayHour = hour24 % 12;
      if (displayHour === 0) displayHour = 12;
      const minStr = mins === 0 ? ':00' : `:${mins.toString().padStart(2, '0')}`;
      const isMidnight = m === 720;
      const isLateNight = m >= 720;
      markers.push({
        minutes: m,
        label: isMidnight ? '12:00 AM' : `${displayHour}${minStr} ${period}`,
        isMidnight,
        isLateNight,
      });
    }
    return markers;
  }, [startMin, endMin]);

  // Core flagship stages
  const coreStageIds = useMemo(() => ['main_stage', 'electric_arena', 'rankins_wood', 'terminus'], []);

  // Stages that actually have acts on this day
  const stagesWithActsOnDay = useMemo(() => {
    const activeStageIds = new Set(dayActs.map((a) => a.stageId));
    return FESTIVAL_STAGES.filter((s) => activeStageIds.has(s.id));
  }, [dayActs]);

  // Stage IDs where user has shortlisted/picked at least one act on this day
  const stagesWithPicksOnDay = useMemo(() => {
    const pickedIds = new Set<string>();
    dayActs.forEach((act) => {
      const pref = userPreferences[act.id];
      const priority = typeof pref === 'object' ? pref.priority : pref;
      if (priority && priority !== 'none') {
        pickedIds.add(act.stageId);
      }
    });
    return pickedIds;
  }, [dayActs, userPreferences]);

  // Default stage IDs to show: Core 4 + any stage where user has picked an act on this day
  const defaultStageIds = useMemo(() => {
    const combined = new Set<string>(coreStageIds);
    stagesWithPicksOnDay.forEach((id) => combined.add(id));
    const activeIdsOnDay = new Set(stagesWithActsOnDay.map((s) => s.id));
    const filtered = Array.from(combined).filter((id) => activeIdsOnDay.has(id));
    if (filtered.length === 0) {
      return stagesWithActsOnDay.map((s) => s.id);
    }
    return filtered;
  }, [coreStageIds, stagesWithPicksOnDay, stagesWithActsOnDay]);

  const [selectedStageIds, setSelectedStageIds] = useState<string[] | null>(null);

  const activeStages = useMemo(() => {
    if (selectedStageIds === null) {
      return stagesWithActsOnDay.filter((s) => defaultStageIds.includes(s.id));
    }
    return stagesWithActsOnDay.filter((s) => selectedStageIds.includes(s.id));
  }, [stagesWithActsOnDay, defaultStageIds, selectedStageIds]);

  const toggleStage = (stageId: string) => {
    const currentList = selectedStageIds === null ? defaultStageIds : selectedStageIds;
    if (currentList.includes(stageId)) {
      setSelectedStageIds(currentList.filter((id) => id !== stageId));
    } else {
      setSelectedStageIds([...currentList, stageId]);
    }
  };

  const selectDefaultStages = () => {
    setSelectedStageIds(null);
  };

  const selectAllStages = () => {
    setSelectedStageIds(stagesWithActsOnDay.map((s) => s.id));
  };

  const deselectAllStages = () => {
    setSelectedStageIds([]);
  };

  const isDefaultActive = selectedStageIds === null;
  const isAllActive =
    selectedStageIds !== null &&
    selectedStageIds.length === stagesWithActsOnDay.length &&
    stagesWithActsOnDay.length > 0;
  const isNoneActive = selectedStageIds !== null && selectedStageIds.length === 0;

  // Time jump intervals
  const timeJumpSections = [
    { label: 'Day (12–5pm)', min: 0, icon: '☀️' },
    { label: 'Evening (5–9pm)', min: 300, icon: '🌇' },
    { label: 'Night (9–12am)', min: 540, icon: '🌟' },
    { label: 'Late (12–4am+)', min: 720, icon: '🌙' },
  ];

  const handleScrollToTime = (targetMinutes: number) => {
    if (!scrollContainerRef.current) return;
    if (displayMode === 'grid') {
      const topOffset = Math.max(0, (targetMinutes - startMin) * pxPerMinute);
      scrollContainerRef.current.scrollTo({
        top: topOffset,
        behavior: 'smooth',
      });
    } else {
      const targetElement = document.getElementById(`stream-time-header-${targetMinutes}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Group acts for Stream View (chronological chunks or stage chunks)
  const streamGroupedActs = useMemo(() => {
    let acts = dayActs;
    if (streamStageFilter !== 'all') {
      acts = acts.filter((a) => a.stageId === streamStageFilter);
    }
    if (onlyShortlisted) {
      acts = acts.filter((a) => {
        const pref = userPreferences[a.id];
        const priority = typeof pref === 'string' ? pref : pref?.priority;
        return priority && priority !== 'none';
      });
    }

    // Sort chronologically
    return [...acts].sort((a, b) => a.startMinutes - b.startMinutes);
  }, [dayActs, streamStageFilter, onlyShortlisted, userPreferences]);

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100">
      {/* Controls Bar */}
      <div className="bg-neutral-900/90 border-b border-neutral-800 p-2.5 sm:p-3 sm:px-6 sticky top-[105px] sm:top-[125px] z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
          {/* Top Bar: View Mode Switcher (Grid vs Stream), Shortlist Toggle, Zoom */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  displayMode === 'grid'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Grid Matrix View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setDisplayMode('stream')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  displayMode === 'stream'
                    ? 'bg-amber-500 text-neutral-950 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Mobile Chronological Stream View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Feed</span>
              </button>
            </div>

            {/* Quick Time Jump Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {timeJumpSections.map((sec) => (
                <button
                  key={sec.label}
                  onClick={() => handleScrollToTime(sec.min)}
                  className="px-2 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-[11px] font-medium text-neutral-300 transition-colors whitespace-nowrap border border-neutral-700/60 flex items-center gap-1 shrink-0 active:scale-95"
                >
                  <span>{sec.icon}</span>
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>

            {/* Right Controls: Shortlist Toggle & Zoom in Grid mode */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 cursor-pointer select-none bg-neutral-800/60 px-2 py-1 rounded-lg border border-neutral-700/50">
                <input
                  type="checkbox"
                  checked={onlyShortlisted}
                  onChange={(e) => setOnlyShortlisted(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] font-medium">Saved only</span>
              </label>

              {displayMode === 'grid' && (
                <div className="hidden sm:flex items-center gap-1 bg-neutral-800/80 rounded-lg p-0.5 border border-neutral-700/60 text-xs">
                  <button
                    onClick={() => setZoomLevel('compact')}
                    className={`px-2 py-1 rounded-md text-[10px] transition-colors ${
                      zoomLevel === 'compact' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
                    }`}
                  >
                    Compact
                  </button>
                  <button
                    onClick={() => setZoomLevel('normal')}
                    className={`px-2 py-1 rounded-md text-[10px] transition-colors ${
                      zoomLevel === 'normal' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setZoomLevel('spacious')}
                    className={`px-2 py-1 rounded-md text-[10px] transition-colors ${
                      zoomLevel === 'spacious' ? 'bg-neutral-700 text-white font-bold' : 'text-neutral-400'
                    }`}
                  >
                    Spacious
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stage selection chips (Scrollable carousel) */}
          {displayMode === 'grid' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
              <span className="text-[11px] font-semibold text-neutral-400 mr-0.5 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" /> Stages:
              </span>

              <button
                onClick={selectDefaultStages}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 shrink-0 ${
                  isDefaultActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60'
                }`}
                title="Show Main Stage, Electric Arena, Rankin's Wood, Terminus + user picks"
              >
                <span>Core + Saved</span>
                <span className="text-[10px] opacity-75">({defaultStageIds.length})</span>
              </button>

              <button
                onClick={selectAllStages}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  isAllActive
                    ? 'bg-neutral-700 text-white border border-neutral-600'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60'
                }`}
              >
                All ({stagesWithActsOnDay.length})
              </button>

              <span className="text-neutral-700 shrink-0">|</span>

              {stagesWithActsOnDay.map((stage) => {
                const isSelected = activeStages.some((s) => s.id === stage.id);
                const hasPicks = stagesWithPicksOnDay.has(stage.id);

                return (
                  <button
                    key={stage.id}
                    onClick={() => toggleStage(stage.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 shrink-0 min-h-[28px] ${
                      isSelected
                        ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                        : 'bg-neutral-900/60 text-neutral-500 border border-neutral-800/60 hover:text-neutral-300'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="whitespace-nowrap">{stage.shortName}</span>
                    {hasPicks && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Contains saved acts" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Stream Mode: Single Stage Filter Chips */
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
              <button
                onClick={() => setStreamStageFilter('all')}
                className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  streamStageFilter === 'all'
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All Stages ({dayActs.length} acts)
              </button>
              {stagesWithActsOnDay.map((stg) => {
                const stageActCount = dayActs.filter((a) => a.stageId === stg.id).length;
                return (
                  <button
                    key={stg.id}
                    onClick={() => setStreamStageFilter(stg.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                      streamStageFilter === stg.id
                        ? 'bg-neutral-800 text-white border border-neutral-600 font-bold shadow-xs'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stg.color }} />
                    <span>{stg.shortName}</span>
                    <span className="text-[10px] text-neutral-500">({stageActCount})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main View Display: Stream Mode OR Grid Matrix Mode */}
      {displayMode === 'stream' ? (
        /* ================= MOBILE CHRONOLOGICAL STREAM VIEW ================= */
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-3xl mx-auto w-full space-y-3">
          {streamGroupedActs.length === 0 ? (
            <div className="p-8 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 text-neutral-400 space-y-2">
              <Filter className="w-8 h-8 mx-auto text-neutral-500" />
              <div className="font-bold text-neutral-200">No acts found</div>
              <p className="text-xs">Try selecting 'All Stages' or turning off 'Saved only'.</p>
            </div>
          ) : (
            streamGroupedActs.map((act, index) => {
              const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
              const pref = userPreferences[act.id];
              const priority: PriorityLevel =
                typeof pref === 'string' ? pref : pref?.priority || 'none';
              const actClashes = getActClashes(act.id, clashes);
              const isClashing = actClashes.length > 0 && priority !== 'none';

              // Card styling
              let borderClass = 'border-neutral-800 bg-neutral-900/90';
              if (priority === 'must_see') {
                borderClass = 'border-amber-500/80 bg-amber-950/30 ring-1 ring-amber-400/40';
              } else if (priority === 'want_to_see') {
                borderClass = 'border-emerald-500/80 bg-emerald-950/30 ring-1 ring-emerald-400/40';
              } else if (priority === 'maybe') {
                borderClass = 'border-sky-500/80 bg-sky-950/30';
              }

              // Check if previous act had a different start time group for clear section anchors
              const prevAct = index > 0 ? streamGroupedActs[index - 1] : null;
              const isNewHour = !prevAct || Math.floor(prevAct.startMinutes / 60) !== Math.floor(act.startMinutes / 60);
              const hourGroupMinutes = Math.floor(act.startMinutes / 60) * 60;

              return (
                <React.Fragment key={act.id}>
                  {isNewHour && (
                    <div
                      id={`stream-time-header-${hourGroupMinutes}`}
                      className="pt-3 pb-1 flex items-center gap-2 text-xs font-bold text-amber-400/90 uppercase tracking-wider"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {act.startMinutes >= 720
                          ? `Late Night Session (${act.displayTime.split(' - ')[0]}) 🌙`
                          : `Time Block: ${act.displayTime.split(' - ')[0]}`}
                      </span>
                      <div className="flex-1 h-px bg-neutral-800" />
                    </div>
                  )}

                  <div
                    id={`stream-act-${act.id}`}
                    onClick={() => onOpenActDetail(act)}
                    className={`rounded-2xl border p-3.5 transition-all shadow-sm active:scale-[0.99] cursor-pointer ${borderClass}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {/* Stage Badge & Headliner / Late Night */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            style={{
                              backgroundColor: `${stage?.color}25`,
                              color: stage?.color,
                              borderColor: `${stage?.color}50`,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage?.color }} />
                            {stage?.shortName}
                          </span>

                          {act.isHeadliner && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950">
                              Headliner
                            </span>
                          )}

                          {act.isIrish && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Irish ☘️
                            </span>
                          )}

                          {act.startMinutes >= 720 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              Late 🌙
                            </span>
                          )}
                        </div>

                        {/* Artist Name */}
                        <h4 className="text-base font-bold text-white truncate leading-tight group-hover:text-amber-300">
                          {act.name}
                        </h4>

                        {/* Timing & Genre */}
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                          <span className="font-semibold text-amber-400">{act.displayTime}</span>
                          <span>•</span>
                          <span className="truncate">{act.genre}</span>
                        </div>
                      </div>

                      {/* Priority Toggle Buttons (Touch-friendly 40px touch area) */}
                      <div
                        className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            onUpdatePriority(
                              act.id,
                              priority === 'must_see' ? 'none' : 'must_see'
                            )
                          }
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            priority === 'must_see'
                              ? 'bg-amber-500 text-neutral-950 shadow-xs'
                              : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                          }`}
                          title="Must See"
                        >
                          <Flame className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            onUpdatePriority(
                              act.id,
                              priority === 'want_to_see' ? 'none' : 'want_to_see'
                            )
                          }
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            priority === 'want_to_see'
                              ? 'bg-emerald-500 text-neutral-950 shadow-xs'
                              : 'text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800'
                          }`}
                          title="Want to See"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            onUpdatePriority(
                              act.id,
                              priority === 'maybe' ? 'none' : 'maybe'
                            )
                          }
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            priority === 'maybe'
                              ? 'bg-sky-500 text-neutral-950 shadow-xs'
                              : 'text-neutral-400 hover:text-sky-400 hover:bg-neutral-800'
                          }`}
                          title="Maybe"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Clash warning banner if active */}
                    {isClashing && (
                      <div className="mt-2 pt-2 border-t border-neutral-800 flex items-center gap-1.5 text-xs text-rose-300 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Clashes with {actClashes.length} other saved act{actClashes.length > 1 ? 's' : ''}!</span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      ) : (
        /* ================= 2D GRID MATRIX VIEW ================= */
        activeStages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">No Stages Selected</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Select stages from the filter bar above, or quickly restore the core stages.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={selectDefaultStages}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-xl text-xs transition-colors shadow-sm"
              >
                Show Default Stages ({defaultStageIds.length})
              </button>
              <button
                onClick={selectAllStages}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl text-xs transition-colors border border-neutral-700"
              >
                Show All ({stagesWithActsOnDay.length})
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-auto relative touch-pan-x touch-pan-y"
          >
            <div
              className="min-w-fit relative pb-16"
              style={{
                height: `${(endMin - startMin) * pxPerMinute + 120}px`,
              }}
            >
              {/* Sticky Stage Column Headers */}
              <div className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 flex shadow-md">
                {/* Time Column Header */}
                <div className="w-16 sm:w-24 shrink-0 p-2 sm:p-2.5 border-r border-neutral-800 text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-center">
                  Time
                </div>

                {/* Stage Headers */}
                {activeStages.map((stage) => (
                  <div
                    key={stage.id}
                    className="w-48 sm:w-64 shrink-0 p-2 sm:p-2.5 border-r border-neutral-800 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {stage.shortName}
                      </h3>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-neutral-400 truncate mt-0.5">
                      {stage.category.toUpperCase()} • {stage.capacity || 'All Welcome'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid Rows & Act Canvas */}
              <div className="relative flex">
                {/* Left Time Ruler */}
                <div className="w-16 sm:w-24 shrink-0 border-r border-neutral-800/80 bg-neutral-900/40 relative select-none">
                  {hourMarkers.map((marker) => {
                    const topPos = (marker.minutes - startMin) * pxPerMinute;
                    const isFullHour = marker.minutes % 60 === 0;
                    return (
                      <div
                        key={marker.minutes}
                        className="absolute left-0 right-0 flex items-center justify-center text-[9px] sm:text-[10px]"
                        style={{ top: `${topPos}px` }}
                      >
                        <span
                          className={`px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] ${
                            marker.isMidnight
                              ? 'font-extrabold text-amber-300 bg-amber-950/80 border border-amber-500/40'
                              : marker.isLateNight && isFullHour
                              ? 'font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-500/30'
                              : isFullHour
                              ? 'font-bold text-neutral-200 bg-neutral-800/80'
                              : 'text-neutral-500 font-medium text-[8px] sm:text-[9px]'
                          }`}
                        >
                          {marker.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Stage Columns with Background Guidelines & Acts */}
                {activeStages.map((stage) => {
                  const stageActs = dayActs.filter((a) => a.stageId === stage.id);

                  return (
                    <div
                      key={stage.id}
                      className="w-48 sm:w-64 shrink-0 border-r border-neutral-800/60 relative bg-neutral-950/40 hover:bg-neutral-900/10 transition-colors"
                    >
                      {/* Horizontal Guideline lines */}
                      {hourMarkers.map((marker) => {
                        const topPos = (marker.minutes - startMin) * pxPerMinute;
                        const isFullHour = marker.minutes % 60 === 0;
                        return (
                          <div
                            key={marker.minutes}
                            className={`absolute left-0 right-0 pointer-events-none ${
                              isFullHour
                                ? 'border-b border-neutral-800/80'
                                : 'border-b border-neutral-900/40 border-dashed'
                            }`}
                            style={{ top: `${topPos}px` }}
                          />
                        );
                      })}

                      {/* Render Act Blocks */}
                      {stageActs.map((act) => {
                        const pref = userPreferences[act.id];
                        const priority: PriorityLevel =
                          typeof pref === 'string' ? pref : pref?.priority || 'none';

                        if (onlyShortlisted && priority === 'none') {
                          return null;
                        }

                        const top = (act.startMinutes - startMin) * pxPerMinute;
                        const height = Math.max(38, act.durationMinutes * pxPerMinute - 4);

                        const actClashes = getActClashes(act.id, clashes);
                        const isClashing = actClashes.length > 0 && priority !== 'none';

                        let borderClass = 'border-neutral-800 bg-neutral-900/90 hover:border-neutral-600';
                        let glowEffect = '';

                        if (priority === 'must_see') {
                          borderClass = 'border-amber-500/80 bg-amber-950/50 shadow-md shadow-amber-500/10';
                          glowEffect = 'ring-1 ring-amber-400/50';
                        } else if (priority === 'want_to_see') {
                          borderClass = 'border-emerald-500/80 bg-emerald-950/50 shadow-md shadow-emerald-500/10';
                          glowEffect = 'ring-1 ring-emerald-400/50';
                        } else if (priority === 'maybe') {
                          borderClass = 'border-sky-500/80 bg-sky-950/50';
                        }

                        return (
                          <div
                            key={act.id}
                            id={`act-card-${act.id}`}
                            onClick={() => onOpenActDetail(act)}
                            className={`absolute left-1 right-1 sm:left-1.5 sm:right-1.5 rounded-lg border p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.01] hover:z-20 ${borderClass} ${glowEffect}`}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                            }}
                          >
                            {/* Top: Artist Name & Badges */}
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <div className="font-bold text-xs sm:text-sm text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
                                  {act.name}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  {act.isHeadliner && (
                                    <span className="px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950">
                                      ★
                                    </span>
                                  )}
                                  {act.startMinutes >= 720 && (
                                    <span className="px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                      🌙
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-[9px] sm:text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                                <span className="font-medium text-neutral-300">{act.displayTime}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="truncate hidden sm:inline">{act.genre}</span>
                              </div>
                            </div>

                            {/* Bottom: Clash Warning & Priority Quick Action Chips */}
                            <div className="flex items-center justify-between gap-1 pt-0.5 mt-auto">
                              {isClashing ? (
                                <div
                                  className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                                  title={`${actClashes.length} schedule conflict!`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenActDetail(act);
                                  }}
                                >
                                  <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                                  <span>Clash</span>
                                </div>
                              ) : (
                                <div className="text-[9px] text-neutral-500">
                                  {act.durationMinutes}m
                                </div>
                              )}

                              {/* Priority Toggles */}
                              <div
                                className="flex items-center gap-0.5 bg-neutral-950/80 rounded-md p-0.5 border border-neutral-800"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    onUpdatePriority(
                                      act.id,
                                      priority === 'must_see' ? 'none' : 'must_see'
                                    )
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    priority === 'must_see'
                                      ? 'bg-amber-500 text-neutral-950'
                                      : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                                  }`}
                                  title="Must See"
                                >
                                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    onUpdatePriority(
                                      act.id,
                                      priority === 'want_to_see' ? 'none' : 'want_to_see'
                                    )
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    priority === 'want_to_see'
                                      ? 'bg-emerald-500 text-neutral-950'
                                      : 'text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800'
                                  }`}
                                  title="Want to See"
                                >
                                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    onUpdatePriority(
                                      act.id,
                                      priority === 'maybe' ? 'none' : 'maybe'
                                    )
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    priority === 'maybe'
                                      ? 'bg-sky-500 text-neutral-950'
                                      : 'text-neutral-400 hover:text-sky-400 hover:bg-neutral-800'
                                  }`}
                                  title="Maybe"
                                >
                                  <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}

      {/* Legend Footer */}
      <div className="bg-neutral-900 border-t border-neutral-800 px-3 sm:px-4 py-2 flex items-center justify-between text-[11px] sm:text-xs text-neutral-400">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-semibold text-neutral-300 hidden xs:inline">Priority:</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Flame className="w-3 h-3 fill-amber-400/20" /> Must
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Star className="w-3 h-3 fill-emerald-400/20" /> Want
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <Eye className="w-3 h-3" /> Maybe
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <AlertTriangle className="w-3 h-3" /> Clash
          </span>
        </div>
        <div className="text-[10px] text-neutral-500">
          Tap card for details &amp; bio
        </div>
      </div>
    </div>
  );
};
