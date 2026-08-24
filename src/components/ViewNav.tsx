import React from 'react';
import { Calendar, ListChecks, AlertTriangle, Compass, MapPin } from 'lucide-react';

export type ViewMode = 'timetable' | 'itinerary' | 'clashes' | 'explorer' | 'map';

interface ViewNavProps {
  activeView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  clashesCount: number;
  selectedActsCount: number;
}

export const ViewNav: React.FC<ViewNavProps> = ({
  activeView,
  onSelectView,
  clashesCount,
  selectedActsCount,
}) => {
  const views: { id: ViewMode; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    {
      id: 'timetable',
      label: 'Stage Timetable',
      icon: Calendar,
    },
    {
      id: 'itinerary',
      label: 'My Itinerary',
      icon: ListChecks,
      badge: selectedActsCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'clashes',
      label: 'Clash Solver',
      icon: AlertTriangle,
      badge: clashesCount,
      badgeColor: clashesCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' : undefined,
    },
    {
      id: 'explorer',
      label: 'Lineup Search',
      icon: Compass,
    },
    {
      id: 'map',
      label: 'Stage Map & Walk Times',
      icon: MapPin,
    },
  ];

  return (
    <nav className="bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
        {views.map((v) => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              id={`nav-tab-${v.id}`}
              onClick={() => onSelectView(v.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-neutral-800 text-white border border-neutral-700 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
              <span>{v.label}</span>
              {typeof v.badge === 'number' && v.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${v.badgeColor || 'bg-neutral-800 text-neutral-300'}`}>
                  {v.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
