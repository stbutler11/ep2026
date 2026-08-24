import React, { useState, useMemo } from 'react';
import {
  Flame,
  Star,
  Eye,
  AlertTriangle,
  Filter,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronRight,
  Info,
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
  const [selectedStages, setSelectedStages] = useState<string[]>(
    FESTIVAL_STAGES.map((s) => s.id)
  );
  const [onlyShortlisted, setOnlyShortlisted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'compact' | 'normal' | 'spacious'>('normal');

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
    // Round down start to nearest hour, round up max to nearest hour
    const roundedStart = Math.floor(min / 60) * 60;
    const roundedEnd = Math.ceil(max / 60) * 60;
    return {
      startMin: Math.max(0, roundedStart - 30), // e.g. 12:30 PM or 1:00 PM
      endMin: Math.min(840, roundedEnd + 30), // up to 2:00 AM
    };
  }, [dayActs]);

  // Generate hour marks
  const hourMarkers = useMemo(() => {
    const markers: { minutes: number; label: string }[] = [];
    for (let m = startMin; m <= endMin; m += 30) {
      const totalHours = 12 + Math.floor(m / 60);
      const hour24 = totalHours % 24;
      const mins = m % 60;
      const period = totalHours >= 12 && totalHours < 24 ? 'PM' : 'AM';
      let displayHour = hour24 % 12;
      if (displayHour === 0) displayHour = 12;
      const minStr = mins === 0 ? ':00' : `:${mins.toString().padStart(2, '0')}`;
      markers.push({
        minutes: m,
        label: `${displayHour}${minStr} ${period}`,
      });
    }
    return markers;
  }, [startMin, endMin]);

  const activeStages = useMemo(() => {
    return FESTIVAL_STAGES.filter((s) => selectedStages.includes(s.id));
  }, [selectedStages]);

  const toggleStage = (stageId: string) => {
    if (selectedStages.includes(stageId)) {
      if (selectedStages.length > 1) {
        setSelectedStages(selectedStages.filter((id) => id !== stageId));
      }
    } else {
      setSelectedStages([...selectedStages, stageId]);
    }
  };

  const selectAllStages = () => {
    setSelectedStages(FESTIVAL_STAGES.map((s) => s.id));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100">
      {/* Controls Bar: Stage Filters, Zoom & Visibility */}
      <div className="bg-neutral-900/90 border-b border-neutral-800 p-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Stage selection chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-neutral-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Stages:
            </span>
            <button
              onClick={selectAllStages}
              className={`text-[11px] px-2 py-1 rounded-md font-medium transition-colors ${
                selectedStages.length === FESTIVAL_STAGES.length
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All
            </button>
            {FESTIVAL_STAGES.map((stage) => {
              const isSelected = selectedStages.includes(stage.id);
              return (
                <button
                  key={stage.id}
                  onClick={() => toggleStage(stage.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                      : 'bg-neutral-900/60 text-neutral-500 border border-neutral-800/60 hover:text-neutral-300'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span>{stage.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* View Toggles & Zoom Controls */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Show Shortlisted Only Toggle */}
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyShortlisted}
                onChange={(e) => setOnlyShortlisted(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-neutral-900"
              />
              <span>Shortlist only</span>
            </label>

            <span className="text-neutral-700">|</span>

            {/* Zoom Selector */}
            <div className="flex items-center gap-1 bg-neutral-800/80 rounded-lg p-0.5 border border-neutral-700/60 text-xs">
              <button
                onClick={() => setZoomLevel('compact')}
                className={`px-2 py-1 rounded-md text-[11px] transition-colors ${
                  zoomLevel === 'compact' ? 'bg-neutral-700 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Compact Zoom"
              >
                Compact
              </button>
              <button
                onClick={() => setZoomLevel('normal')}
                className={`px-2 py-1 rounded-md text-[11px] transition-colors ${
                  zoomLevel === 'normal' ? 'bg-neutral-700 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Normal Zoom"
              >
                Standard
              </button>
              <button
                onClick={() => setZoomLevel('spacious')}
                className={`px-2 py-1 rounded-md text-[11px] transition-colors ${
                  zoomLevel === 'spacious' ? 'bg-neutral-700 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Expanded Zoom"
              >
                Spacious
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Interactive Grid Container */}
      <div className="flex-1 overflow-auto relative">
        <div
          className="min-w-fit relative pb-16"
          style={{
            height: `${(endMin - startMin) * pxPerMinute + 120}px`,
          }}
        >
          {/* Sticky Stage Column Headers */}
          <div className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 flex shadow-md">
            {/* Time Column Header */}
            <div className="w-20 sm:w-24 shrink-0 p-2.5 border-r border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center justify-center">
              Time
            </div>

            {/* Stage Headers */}
            {activeStages.map((stage) => (
              <div
                key={stage.id}
                className="w-56 sm:w-64 shrink-0 p-2.5 border-r border-neutral-800 flex flex-col justify-center"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                    {stage.shortName}
                  </h3>
                </div>
                <div className="text-[10px] text-neutral-400 truncate mt-0.5">
                  {stage.category.toUpperCase()} • {stage.capacity || 'All Welcome'}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid Rows & Act Canvas */}
          <div className="relative flex">
            {/* Left Time Ruler */}
            <div className="w-20 sm:w-24 shrink-0 border-r border-neutral-800/80 bg-neutral-900/40 relative select-none">
              {hourMarkers.map((marker) => {
                const topPos = (marker.minutes - startMin) * pxPerMinute;
                const isFullHour = marker.minutes % 60 === 0;
                return (
                  <div
                    key={marker.minutes}
                    className="absolute left-0 right-0 flex items-center justify-center text-[10px]"
                    style={{ top: `${topPos}px` }}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        isFullHour
                          ? 'font-bold text-neutral-200 bg-neutral-800/80'
                          : 'text-neutral-500 font-medium text-[9px]'
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
                  className="w-56 sm:w-64 shrink-0 border-r border-neutral-800/60 relative bg-neutral-950/40 hover:bg-neutral-900/10 transition-colors"
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

                    // Filter out if user selected "shortlist only" and act is not chosen
                    if (onlyShortlisted && priority === 'none') {
                      return null;
                    }

                    const top = (act.startMinutes - startMin) * pxPerMinute;
                    const height = Math.max(36, act.durationMinutes * pxPerMinute - 4);

                    const actClashes = getActClashes(act.id, clashes);
                    const isClashing = actClashes.length > 0 && priority !== 'none';

                    // Card Styling based on Priority & Headliner status
                    let borderClass = 'border-neutral-800 bg-neutral-900/80 hover:border-neutral-600';
                    let glowEffect = '';

                    if (priority === 'must_see') {
                      borderClass = 'border-amber-500/80 bg-amber-950/40 shadow-md shadow-amber-500/10';
                      glowEffect = 'ring-1 ring-amber-400/50';
                    } else if (priority === 'want_to_see') {
                      borderClass = 'border-emerald-500/80 bg-emerald-950/40 shadow-md shadow-emerald-500/10';
                      glowEffect = 'ring-1 ring-emerald-400/50';
                    } else if (priority === 'maybe') {
                      borderClass = 'border-sky-500/80 bg-sky-950/40';
                    }

                    return (
                      <div
                        key={act.id}
                        id={`act-card-${act.id}`}
                        onClick={() => onOpenActDetail(act)}
                        className={`absolute left-1.5 right-1.5 rounded-lg border p-2 flex flex-col justify-between transition-all cursor-pointer group hover:scale-[1.01] hover:z-20 ${borderClass} ${glowEffect}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                      >
                        {/* Top Row: Artist Name & Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <div className="font-bold text-xs sm:text-sm text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug">
                              {act.name}
                            </div>
                            {act.isHeadliner && (
                              <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950">
                                Headliner
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium text-neutral-300">{act.displayTime}</span>
                            <span>•</span>
                            <span className="truncate">{act.genre}</span>
                          </div>
                        </div>

                        {/* Bottom Row: Clash Warning & Priority Quick Action Chips */}
                        <div className="flex items-center justify-between gap-1 pt-1 mt-auto">
                          {/* Clash Badge */}
                          {isClashing ? (
                            <div
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                              title={`${actClashes.length} schedule conflict!`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenActDetail(act);
                              }}
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>Clash!</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-neutral-500">
                              {act.durationMinutes}m
                            </div>
                          )}

                          {/* Quick Priority Toggle Buttons */}
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
                              title="Mark as Must See (Top Priority)"
                            >
                              <Flame className="w-3 h-3" />
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
                              title="Mark as Want to See"
                            >
                              <Star className="w-3 h-3" />
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
                              title="Mark as Maybe / Backup"
                            >
                              <Eye className="w-3 h-3" />
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

      {/* Floating Legend / Quick Help Footer */}
      <div className="bg-neutral-900 border-t border-neutral-800 px-4 py-2 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-neutral-300">Priority Legend:</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Flame className="w-3 h-3 fill-amber-400/20" /> Must See
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Star className="w-3 h-3 fill-emerald-400/20" /> Want to See
          </span>
          <span className="flex items-center gap-1 text-sky-400">
            <Eye className="w-3 h-3" /> Maybe / If Free
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <AlertTriangle className="w-3 h-3" /> Overlapping Clash
          </span>
        </div>
        <div className="hidden sm:block text-[11px] text-neutral-500">
          Tip: Click any act card for bio, Spotify &amp; notes
        </div>
      </div>
    </div>
  );
};
