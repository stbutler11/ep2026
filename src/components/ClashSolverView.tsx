import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Flame,
  Star,
  Eye,
  Split,
  Footprints,
} from 'lucide-react';
import { Act, ClashDetail, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { FESTIVAL_STAGES, getWalkingTime } from '../data/festivalData';
import { getPriorityBadgeColor, getPriorityLabel } from '../utils/scheduleUtils';
import confetti from 'canvas-confetti';

interface ClashSolverViewProps {
  day: FestivalDay;
  clashes: ClashDetail[];
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  onUpdatePriority: (actId: string, priority: PriorityLevel) => void;
  onUpdateNotes: (actId: string, notes: string) => void;
  onOpenActDetail: (act: Act) => void;
}

export const ClashSolverView: React.FC<ClashSolverViewProps> = ({
  day,
  clashes,
  userPreferences,
  onUpdatePriority,
  onUpdateNotes,
  onOpenActDetail,
}) => {
  const dayClashes = clashes.filter(
    (c) => c.act1.day === day && c.act2.day === day
  );

  const handleSplitSet = (clash: ClashDetail) => {
    const act1 = clash.act1;
    const act2 = clash.act2;
    const walkTime = clash.walkingTimeMinutes;

    // Split plan: Watch act 1 until middle of overlap, walk, watch act 2
    const splitPointMinutes = Math.floor((clash.overlapStartMinutes + clash.overlapEndMinutes) / 2);

    const note1 = `Split set: Leave at approx ${formatMinutesToDisplay(splitPointMinutes - walkTime)} for ${act2.name}`;
    const note2 = `Split set: Arrive approx ${formatMinutesToDisplay(splitPointMinutes)} from ${act1.name}`;

    onUpdateNotes(act1.id, note1);
    onUpdateNotes(act2.id, note2);

    confetti({ particleCount: 40, spread: 50 });
  };

  function formatMinutesToDisplay(mins: number): string {
    const totalHours = 12 + Math.floor(mins / 60);
    const hour24 = totalHours % 24;
    const m = mins % 60;
    const period = totalHours >= 12 && totalHours < 24 ? 'PM' : 'AM';
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Stage Clash Center
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                dayClashes.length > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {dayClashes.length} conflict{dayClashes.length === 1 ? '' : 's'} on {day}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Compare colliding acts side-by-side, decide which to prioritize, or calculate a smart split-set plan.
          </p>
        </div>
      </div>

      {/* No Clashes State */}
      {dayClashes.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Schedule Clashes!</h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Your {day} selections don't have any overlapping times. You'll be able to move seamlessly from stage to stage.
            </p>
          </div>
        </div>
      ) : (
        /* Clashing Pairs List */
        <div className="space-y-6">
          {dayClashes.map((clash, idx) => {
            const act1 = clash.act1;
            const act2 = clash.act2;

            const stage1 = FESTIVAL_STAGES.find((s) => s.id === act1.stageId);
            const stage2 = FESTIVAL_STAGES.find((s) => s.id === act2.stageId);

            const pref1 = userPreferences[act1.id];
            const pref2 = userPreferences[act2.id];

            const priority1: PriorityLevel =
              typeof pref1 === 'string' ? pref1 : pref1?.priority || 'none';
            const priority2: PriorityLevel =
              typeof pref2 === 'string' ? pref2 : pref2?.priority || 'none';

            const style1 = getPriorityBadgeColor(priority1);
            const style2 = getPriorityBadgeColor(priority2);

            return (
              <div
                key={clash.id}
                id={`clash-item-${idx}`}
                className="bg-neutral-900 border border-rose-500/40 rounded-2xl p-5 shadow-md relative space-y-4"
              >
                {/* Clash Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {act1.name} vs {act2.name}
                      </h4>
                      <div className="text-[11px] text-neutral-400">
                        Overlap: <strong className="text-rose-400">{clash.overlapDurationMinutes} mins</strong> ({clash.severity} overlap)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800 self-start sm:self-auto">
                    <Footprints className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {stage1?.shortName} ↔ {stage2?.shortName}: ~{clash.walkingTimeMinutes} min walk
                    </span>
                  </div>
                </div>

                {/* Side-by-Side Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Act 1 Card */}
                  <div className="bg-neutral-950/80 rounded-xl p-4 border border-neutral-800 flex flex-col justify-between space-y-3 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1"
                      style={{ backgroundColor: stage1?.color }}
                    />
                    <div className="space-y-2 pl-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold border"
                          style={{
                            backgroundColor: `${stage1?.color}15`,
                            color: stage1?.color,
                            borderColor: `${stage1?.color}40`,
                          }}
                        >
                          {stage1?.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${style1.bg} ${style1.text} ${style1.border}`}>
                          {getPriorityLabel(priority1)}
                        </span>
                      </div>

                      <div>
                        <h5
                          onClick={() => onOpenActDetail(act1)}
                          className="text-base font-extrabold text-white hover:text-amber-300 cursor-pointer"
                        >
                          {act1.name}
                        </h5>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {act1.displayTime} • {act1.genre}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {act1.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                      <button
                        onClick={() => {
                          onUpdatePriority(act1.id, 'must_see');
                          onUpdatePriority(act2.id, 'none');
                        }}
                        className="w-full text-center px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
                      >
                        Keep {act1.name} (Skip {act2.name})
                      </button>
                    </div>
                  </div>

                  {/* Act 2 Card */}
                  <div className="bg-neutral-950/80 rounded-xl p-4 border border-neutral-800 flex flex-col justify-between space-y-3 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1"
                      style={{ backgroundColor: stage2?.color }}
                    />
                    <div className="space-y-2 pl-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold border"
                          style={{
                            backgroundColor: `${stage2?.color}15`,
                            color: stage2?.color,
                            borderColor: `${stage2?.color}40`,
                          }}
                        >
                          {stage2?.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${style2.bg} ${style2.text} ${style2.border}`}>
                          {getPriorityLabel(priority2)}
                        </span>
                      </div>

                      <div>
                        <h5
                          onClick={() => onOpenActDetail(act2)}
                          className="text-base font-extrabold text-white hover:text-amber-300 cursor-pointer"
                        >
                          {act2.name}
                        </h5>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {act2.displayTime} • {act2.genre}
                        </p>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {act2.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                      <button
                        onClick={() => {
                          onUpdatePriority(act2.id, 'must_see');
                          onUpdatePriority(act1.id, 'none');
                        }}
                        className="w-full text-center px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
                      >
                        Keep {act2.name} (Skip {act1.name})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Split Set Alternative Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Split className="w-4 h-4 text-sky-400" />
                    <span>Can't pick? Split your time between both stages:</span>
                  </div>
                  <button
                    onClick={() => handleSplitSet(clash)}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sky-300 text-xs font-semibold border border-neutral-700 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>Create Split-Set Notes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
