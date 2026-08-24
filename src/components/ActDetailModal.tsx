import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Flame,
  Star,
  Eye,
  AlertTriangle,
  ExternalLink,
  StickyNote,
  Music,
  Share2,
  Footprints,
} from 'lucide-react';
import { Act, ClashDetail, PriorityLevel, UserActPreference } from '../types';
import { FESTIVAL_STAGES, getWalkingTime } from '../data/festivalData';
import { getActClashes, getPriorityBadgeColor, getPriorityLabel } from '../utils/scheduleUtils';

interface ActDetailModalProps {
  act: Act | null;
  onClose: () => void;
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  onUpdatePriority: (actId: string, priority: PriorityLevel) => void;
  onUpdateNotes: (actId: string, notes: string) => void;
  clashes: ClashDetail[];
}

export const ActDetailModal: React.FC<ActDetailModalProps> = ({
  act,
  onClose,
  userPreferences,
  onUpdatePriority,
  onUpdateNotes,
  clashes,
}) => {
  if (!act) return null;

  const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
  const pref = userPreferences[act.id];
  const priority: PriorityLevel =
    typeof pref === 'string' ? pref : pref?.priority || 'none';
  const existingNotes = typeof pref === 'object' ? pref?.notes || '' : '';

  const [notes, setNotes] = useState(existingNotes);
  const [savedNotesMessage, setSavedNotesMessage] = useState(false);

  const actClashes = getActClashes(act.id, clashes);
  const isClashing = actClashes.length > 0;
  const priorityStyle = getPriorityBadgeColor(priority);

  const handleSaveNotes = () => {
    onUpdateNotes(act.id, notes);
    setSavedNotesMessage(true);
    setTimeout(() => setSavedNotesMessage(false), 2000);
  };

  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(act.name)}`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(act.name + ' live')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Area */}
        <div
          className="p-6 relative overflow-hidden border-b border-neutral-800"
          style={{
            background: `linear-gradient(135deg, ${stage?.color}20 0%, #171717 100%)`,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-neutral-950/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: `${stage?.color}30`,
                color: stage?.color,
                borderColor: `${stage?.color}60`,
              }}
            >
              {stage?.name}
            </span>

            {act.isHeadliner && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950">
                Main Headliner
              </span>
            )}

            {act.isIrish && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Irish ☘️
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {act.name}
          </h2>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-300 mt-2 flex-wrap font-medium">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock className="w-4 h-4" />
              <span>{act.displayTime}</span>
              <span>({act.durationMinutes} mins)</span>
            </div>
            <span>•</span>
            <span className="capitalize">{act.day}, Aug 2026</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Priority Level Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Set Your Schedule Priority:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onUpdatePriority(act.id, 'must_see')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  priority === 'must_see'
                    ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-amber-500/50'
                }`}
              >
                <Flame className={`w-4 h-4 ${priority === 'must_see' ? 'fill-neutral-950' : 'text-amber-400'}`} />
                <span>Must See</span>
              </button>

              <button
                onClick={() => onUpdatePriority(act.id, 'want_to_see')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  priority === 'want_to_see'
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-emerald-500/50'
                }`}
              >
                <Star className={`w-4 h-4 ${priority === 'want_to_see' ? 'fill-neutral-950' : 'text-emerald-400'}`} />
                <span>Want to See</span>
              </button>

              <button
                onClick={() => onUpdatePriority(act.id, 'maybe')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  priority === 'maybe'
                    ? 'bg-sky-500 text-neutral-950 border-sky-400 shadow-md shadow-sky-500/20 scale-[1.02]'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-sky-500/50'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Maybe / Backup</span>
              </button>

              <button
                onClick={() => onUpdatePriority(act.id, 'none')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                  priority === 'none'
                    ? 'bg-neutral-800 text-neutral-300 border-neutral-700'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <X className="w-4 h-4" />
                <span>Skip</span>
              </button>
            </div>
          </div>

          {/* Clash Alert warning if applicable */}
          {isClashing && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Schedule Clash with your other saved acts:</span>
              </div>
              <div className="space-y-1 pl-6">
                {actClashes.map((c) => {
                  const otherAct = c.act1.id === act.id ? c.act2 : c.act1;
                  const otherStage = FESTIVAL_STAGES.find((s) => s.id === otherAct.stageId);
                  return (
                    <div key={c.id} className="text-xs text-neutral-300">
                      • <strong>{otherAct.name}</strong> on {otherStage?.shortName} ({otherAct.displayTime}) — <span className="text-rose-400 font-semibold">{c.overlapDurationMinutes}m overlap</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description & Genre */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              About the Artist &amp; Set
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed">
              {act.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
              <span className="font-semibold text-neutral-300">Genre:</span>
              <span>{act.genre}</span>
              {act.membersOrOrigin && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-neutral-300">Origin:</span>
                  <span>{act.membersOrOrigin}</span>
                </>
              )}
            </div>
          </div>

          {/* Listen Shortcuts */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Listen &amp; Preview
            </div>
            <div className="flex items-center gap-3">
              <a
                href={spotifySearchUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors"
              >
                <Music className="w-4 h-4 text-emerald-400" />
                <span>Search on Spotify</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <a
                href={youtubeSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-rose-400" />
                <span>Live Sets on YouTube</span>
              </a>
            </div>
          </div>

          {/* Personal Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                <span>Personal Note for this Set</span>
              </label>
              {savedNotesMessage && (
                <span className="text-xs text-emerald-400 font-semibold">
                  Note saved!
                </span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leave 15m early to get to Terminus; Meet group near soundboard..."
              className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500 resize-none h-20"
            />
            <button
              onClick={handleSaveNotes}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
