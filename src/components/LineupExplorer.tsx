import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Flame,
  Star,
  Eye,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Music,
  Check,
  X,
} from 'lucide-react';
import { Act, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { FESTIVAL_ACTS, FESTIVAL_STAGES } from '../data/festivalData';
import { getPriorityBadgeColor } from '../utils/scheduleUtils';

interface LineupExplorerProps {
  dayFilter: FestivalDay;
  onSelectDay: (day: FestivalDay) => void;
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  onUpdatePriority: (actId: string, priority: PriorityLevel) => void;
  onOpenActDetail: (act: Act) => void;
}

export const LineupExplorer: React.FC<LineupExplorerProps> = ({
  dayFilter,
  onSelectDay,
  userPreferences,
  onUpdatePriority,
  onOpenActDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [onlyHeadliners, setOnlyHeadliners] = useState(false);
  const [onlyIrish, setOnlyIrish] = useState(false);

  // Extract distinct genres
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    FESTIVAL_ACTS.forEach((act) => {
      act.genre.split('/').forEach((g) => genres.add(g.trim()));
    });
    return Array.from(genres).sort();
  }, []);

  // Filtered Acts list
  const filteredActs = useMemo(() => {
    return FESTIVAL_ACTS.filter((act) => {
      // Day filter
      if (act.day !== dayFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = act.name.toLowerCase().includes(q);
        const matchesDesc = act.description.toLowerCase().includes(q);
        const matchesGenre = act.genre.toLowerCase().includes(q);
        const matchesOrigin = act.membersOrOrigin?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesGenre && !matchesOrigin) {
          return false;
        }
      }

      // Stage filter
      if (selectedStage !== 'all' && act.stageId !== selectedStage) {
        return false;
      }

      // Genre filter
      if (selectedGenre !== 'all' && !act.genre.toLowerCase().includes(selectedGenre.toLowerCase())) {
        return false;
      }

      // Headliners
      if (onlyHeadliners && !act.isHeadliner) {
        return false;
      }

      // Irish Acts
      if (onlyIrish && !act.isIrish) {
        return false;
      }

      // Priority filter
      const pref = userPreferences[act.id];
      const priority: PriorityLevel =
        typeof pref === 'string' ? pref : pref?.priority || 'none';

      if (selectedPriority !== 'all') {
        if (selectedPriority === 'selected' && priority === 'none') return false;
        if (selectedPriority !== 'selected' && priority !== selectedPriority) return false;
      }

      return true;
    }).sort((a, b) => a.startMinutes - b.startMinutes);
  }, [
    dayFilter,
    searchQuery,
    selectedStage,
    selectedGenre,
    onlyHeadliners,
    onlyIrish,
    selectedPriority,
    userPreferences,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search & Filter Controls Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by artist, stage, genre (e.g., Fontaines D.C., CMAT, Techno, Post-Punk)..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-hidden focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Quick Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stage selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Stage
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">All Stages</option>
              {FESTIVAL_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
          </div>

          {/* Genre selector */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              Genre
            </label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">All Genres</option>
              {allGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
              My Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 focus:outline-hidden focus:border-amber-500"
            >
              <option value="all">All Acts</option>
              <option value="selected">Any Shortlisted (Must/Want/Maybe)</option>
              <option value="must_see">🔥 Must See Only</option>
              <option value="want_to_see">⭐ Want to See Only</option>
              <option value="maybe">👀 Maybe Only</option>
              <option value="none">Not Selected</option>
            </select>
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-col justify-end gap-1.5">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyHeadliners}
                onChange={(e) => setOnlyHeadliners(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-amber-500"
              />
              <span>Headliners only</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyIrish}
                onChange={(e) => setOnlyIrish(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-neutral-800 border-neutral-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Irish acts ☘️</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-400">
          Showing <strong className="text-neutral-200">{filteredActs.length}</strong> acts on {dayFilter}
        </div>
      </div>

      {/* Acts Grid */}
      {filteredActs.length === 0 ? (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-10 text-center space-y-3">
          <p className="text-sm text-neutral-400">
            No acts match your search filters for {dayFilter}.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStage('all');
              setSelectedGenre('all');
              setSelectedPriority('all');
              setOnlyHeadliners(false);
              setOnlyIrish(false);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActs.map((act) => {
            const stage = FESTIVAL_STAGES.find((s) => s.id === act.stageId);
            const pref = userPreferences[act.id];
            const priority: PriorityLevel =
              typeof pref === 'string' ? pref : pref?.priority || 'none';
            const priorityStyle = getPriorityBadgeColor(priority);

            return (
              <div
                key={act.id}
                id={`explorer-card-${act.id}`}
                className={`bg-neutral-900 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-neutral-700 shadow-sm relative overflow-hidden group ${
                  priority === 'must_see'
                    ? 'border-amber-500/60 shadow-amber-950/20'
                    : priority === 'want_to_see'
                    ? 'border-emerald-500/60'
                    : 'border-neutral-800'
                }`}
              >
                {/* Stage Accent Line */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: stage?.color }}
                />

                <div className="space-y-2.5 pl-1.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                      style={{
                        backgroundColor: `${stage?.color}15`,
                        color: stage?.color,
                        borderColor: `${stage?.color}40`,
                      }}
                    >
                      {stage?.name}
                    </span>

                    <div className="flex items-center gap-1">
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
                    </div>
                  </div>

                  {/* Act Name & Time */}
                  <div>
                    <h3
                      onClick={() => onOpenActDetail(act)}
                      className="text-base sm:text-lg font-extrabold text-white group-hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      {act.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="font-semibold text-neutral-200">{act.displayTime}</span>
                      <span>•</span>
                      <span>{act.durationMinutes}m</span>
                    </div>
                  </div>

                  {/* Genre & Bio */}
                  <div>
                    <div className="text-[11px] font-medium text-neutral-400">{act.genre}</div>
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mt-1">
                      {act.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Priority Actions */}
                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2 pl-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400">
                    Schedule Priority:
                  </span>

                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      onClick={() =>
                        onUpdatePriority(
                          act.id,
                          priority === 'must_see' ? 'none' : 'must_see'
                        )
                      }
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        priority === 'must_see'
                          ? 'bg-amber-500 text-neutral-950'
                          : 'text-neutral-400 hover:text-amber-400'
                      }`}
                      title="Must See (Top Priority)"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Must</span>
                    </button>
                    <button
                      onClick={() =>
                        onUpdatePriority(
                          act.id,
                          priority === 'want_to_see' ? 'none' : 'want_to_see'
                        )
                      }
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        priority === 'want_to_see'
                          ? 'bg-emerald-500 text-neutral-950'
                          : 'text-neutral-400 hover:text-emerald-400'
                      }`}
                      title="Want to See"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Want</span>
                    </button>
                    <button
                      onClick={() =>
                        onUpdatePriority(
                          act.id,
                          priority === 'maybe' ? 'none' : 'maybe'
                        )
                      }
                      className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        priority === 'maybe'
                          ? 'bg-sky-500 text-neutral-950'
                          : 'text-neutral-400 hover:text-sky-400'
                      }`}
                      title="Maybe / Backup"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
