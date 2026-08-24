import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Flame,
  Star,
  Eye,
  AlertTriangle,
  ArrowRight,
  Footprints,
  Coffee,
  CheckCircle2,
  Share2,
  Trash2,
  StickyNote,
} from 'lucide-react';
import { Act, ClashDetail, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { FESTIVAL_ACTS, FESTIVAL_STAGES, getWalkingTime } from '../data/festivalData';
import {
  getActClashes,
  getPriorityBadgeColor,
  getPriorityLabel,
} from '../utils/scheduleUtils';

interface MyItineraryViewProps {
  day: FestivalDay;
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  onUpdatePriority: (actId: string, priority: PriorityLevel) => void;
  onUpdateNotes: (actId: string, notes: string) => void;
  onOpenActDetail: (act: Act) => void;
  clashes: ClashDetail[];
}

export const MyItineraryView: React.FC<MyItineraryViewProps> = ({
  day,
  userPreferences,
  onUpdatePriority,
  onUpdateNotes,
  onOpenActDetail,
  clashes,
}) => {
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Filter user's chosen acts for the current day
  const myActs = FESTIVAL_ACTS.filter((act) => {
    if (act.day !== day) return false;
    const pref = userPreferences[act.id];
    const priority = typeof pref === 'string' ? pref : pref?.priority;
    return priority && priority !== 'none';
  }).sort((a, b) => a.startMinutes - b.startMinutes);

  const handleSaveNotes = (actId: string) => {
    onUpdateNotes(actId, noteDraft);
    setEditingNotesId(null);
  };

  const totalDurationMinutes = myActs.reduce((acc, act) => acc + act.durationMinutes, 0);
  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Stats */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              My {day.charAt(0).toUpperCase() + day.slice(1)} Itinerary
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {myActs.length} acts scheduled
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Total Live Music: <span className="text-neutral-200 font-semibold">{hours}h {mins > 0 ? `${mins}m` : ''}</span> • Stradbally Hall
          </p>
        </div>
      </div>

      {/* Empty State if no acts selected */}
      {myActs.length === 0 ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto text-neutral-400">
            <Flame className="w-8 h-8 text-amber-500/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Your {day} schedule is empty</h3>
            <p className="text-sm text-neutral-400 max-w-md mx-auto">
              Browse the Stage Timetable or Lineup Explorer to shortlist your favorite acts. You can set priorities (Must See, Want to See, Maybe) to build your ultimate festival plan.
            </p>
          </div>
        </div>
      ) : (
        /* Chronological Timeline */
        <div className="space-y-4 relative">
          {myActs.map((act, index) => {
            const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
            const pref = userPreferences[act.id];
            const priority: PriorityLevel =
              typeof pref === 'string' ? pref : pref?.priority || 'none';
            const notes = typeof pref === 'object' ? pref?.notes : '';
            const actClashes = getActClashes(act.id, clashes);
            const hasClash = actClashes.length > 0;
            const priorityStyle = getPriorityBadgeColor(priority);

            // Calculate gap & walking distance from previous act
            let gapMinutes = 0;
            let walkInfo = { minutes: 0, meters: 0 };
            let hasTightTurnaround = false;

            if (index > 0) {
              const prevAct = myActs[index - 1];
              gapMinutes = act.startMinutes - prevAct.endMinutes;
              walkInfo = getWalkingTime(prevAct.stageId, act.stageId);
              if (gapMinutes < walkInfo.minutes && prevAct.stageId !== act.stageId) {
                hasTightTurnaround = true;
              }
            }

            return (
              <React.Fragment key={act.id}>
                {/* Gap / Walking Distance Connector from Previous Act */}
                {index > 0 && (
                  <div className="px-4 py-2 my-1 flex items-center justify-between text-xs rounded-xl bg-neutral-900/40 border border-neutral-800/60 text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Footprints className="w-3.5 h-3.5 text-neutral-500" />
                      <span>
                        Walk from <strong className="text-neutral-300">{FESTIVAL_STAGES.find(s => s.id === myActs[index - 1].stageId)?.shortName}</strong>: ~{walkInfo.minutes} mins ({walkInfo.meters}m)
                      </span>
                    </div>

                    {gapMinutes > 30 ? (
                      <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                        <Coffee className="w-3.5 h-3.5" />
                        <span>{gapMinutes}m break (Food / Drinks / Relax)</span>
                      </div>
                    ) : hasTightTurnaround ? (
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Tight transfer! Leave previous set 5m early</span>
                      </div>
                    ) : (
                      <div className="text-neutral-500">
                        {gapMinutes > 0 ? `${gapMinutes}m buffer` : 'Direct transition'}
                      </div>
                    )}
                  </div>
                )}

                {/* Act Card */}
                <div
                  id={`itinerary-act-${act.id}`}
                  className={`bg-neutral-900 rounded-2xl border transition-all p-5 shadow-sm relative overflow-hidden group ${
                    hasClash
                      ? 'border-rose-500/60 shadow-rose-950/20'
                      : priority === 'must_see'
                      ? 'border-amber-500/60 shadow-amber-950/20'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Left Colored Accent Bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ backgroundColor: stage?.color || '#f59e0b' }}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Main Details */}
                    <div className="space-y-1.5 pl-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                          style={{
                            backgroundColor: `${stage?.color}20`,
                            color: stage?.color,
                            borderColor: `${stage?.color}50`,
                          }}
                        >
                          {stage?.name}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}>
                          {priority === 'must_see' && <Flame className="w-3 h-3 inline mr-1 fill-amber-400/30" />}
                          {priority === 'want_to_see' && <Star className="w-3 h-3 inline mr-1 fill-emerald-400/30" />}
                          {priority === 'maybe' && <Eye className="w-3 h-3 inline mr-1" />}
                          {getPriorityLabel(priority)}
                        </span>

                        {act.isHeadliner && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950">
                            Headliner
                          </span>
                        )}
                      </div>

                      <div className="pt-1">
                        <h3
                          onClick={() => onOpenActDetail(act)}
                          className="text-lg sm:text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {act.name}
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-neutral-200">{act.displayTime}</span>
                          <span>•</span>
                          <span>{act.durationMinutes} mins</span>
                          <span>•</span>
                          <span>{act.genre}</span>
                        </p>
                      </div>

                      <p className="text-xs text-neutral-300 line-clamp-2 max-w-xl pt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>

                    {/* Priority Controller & Actions */}
                    <div className="flex items-center sm:flex-col items-end gap-2 shrink-0 self-end sm:self-start">
                      <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                        <button
                          onClick={() => onUpdatePriority(act.id, 'must_see')}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                            priority === 'must_see' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-amber-400'
                          }`}
                          title="Must See"
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdatePriority(act.id, 'want_to_see')}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                            priority === 'want_to_see' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:text-emerald-400'
                          }`}
                          title="Want to See"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdatePriority(act.id, 'maybe')}
                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                            priority === 'maybe' ? 'bg-sky-500 text-neutral-950' : 'text-neutral-400 hover:text-sky-400'
                          }`}
                          title="Maybe"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdatePriority(act.id, 'none')}
                          className="px-2 py-1 rounded-lg text-xs text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                          title="Remove from Itinerary"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (editingNotesId === act.id) {
                            setEditingNotesId(null);
                          } else {
                            setEditingNotesId(act.id);
                            setNoteDraft(notes || '');
                          }
                        }}
                        className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                        <span>{notes ? 'Edit note' : '+ Add note'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Clash Alert Box if conflicting */}
                  {hasClash && (
                    <div className="mt-3.5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2">
                      <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                        <span>Time Clash Detected with other shortlisted acts:</span>
                      </div>
                      <div className="space-y-1 pl-6">
                        {actClashes.map((c) => {
                          const otherAct = c.act1.id === act.id ? c.act2 : c.act1;
                          const otherStage = FESTIVAL_STAGES.find((s) => s.id === otherAct.stageId);
                          return (
                            <div
                              key={c.id}
                              className="text-xs text-neutral-300 flex items-center justify-between gap-2"
                            >
                              <span>
                                • <strong>{otherAct.name}</strong> on {otherStage?.shortName} ({otherAct.displayTime}) — <span className="text-rose-400 font-semibold">{c.overlapDurationMinutes}m overlap</span>
                              </span>
                              <button
                                onClick={() => onUpdatePriority(otherAct.id, 'none')}
                                className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors"
                              >
                                Keep {act.name} only
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Personal Notes Section */}
                  {(notes || editingNotesId === act.id) && (
                    <div className="mt-3 pt-3 border-t border-neutral-800/80">
                      {editingNotesId === act.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="e.g. Meet friends by left speaker stack; Leave 10 mins early for Gorillaz..."
                            className="w-full text-xs bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-neutral-200 focus:outline-hidden focus:border-amber-500 resize-none h-16"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNotes(act.id)}
                              className="px-3 py-1 text-xs bg-amber-500 text-neutral-950 font-bold rounded-lg hover:bg-amber-400"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-xs text-amber-200/90 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-xl">
                          <StickyNote className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-semibold text-amber-400">My Note:</span> {notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
