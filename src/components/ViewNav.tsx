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
  const views: {
    id: ViewMode;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'timetable',
      label: 'Stage Timetable',
      shortLabel: 'Timetable',
      icon: Calendar,
    },
    {
      id: 'itinerary',
      label: 'My Itinerary',
      shortLabel: 'My Schedule',
      icon: ListChecks,
      badge: selectedActsCount,
      badgeColor: 'bg-emerald-500 text-neutral-950',
    },
    {
      id: 'clashes',
      label: 'Clash Solver',
      shortLabel: 'Clashes',
      icon: AlertTriangle,
      badge: clashesCount,
      badgeColor: clashesCount > 0 ? 'bg-rose-500 text-white animate-pulse' : undefined,
    },
    {
      id: 'explorer',
      label: 'Lineup Search',
      shortLabel: 'Search',
      icon: Compass,
    },
    {
      id: 'map',
      label: 'Stage Map & Walk Times',
      shortLabel: 'Map & Walk',
      icon: MapPin,
    },
  ];

  return (
    <>
      {/* Desktop Top Navigation (Visible sm and up) */}
      <nav className="hidden sm:block bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6">
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
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      v.badgeColor || 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {v.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Sticky Bottom Tab Bar (Visible on phones) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800/90 px-2 py-1 shadow-[0_-8px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = activeView === v.id;
            return (
              <button
                key={v.id}
                id={`mobile-nav-tab-${v.id}`}
                onClick={() => onSelectView(v.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[56px] min-h-[48px] ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'scale-110 text-amber-400' : 'text-neutral-400'
                    }`}
                  />
                  {typeof v.badge === 'number' && v.badge > 0 && (
                    <span
                      className={`absolute -top-1.5 -right-2 text-[9px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center font-black leading-none shadow-sm ${
                        v.badgeColor || 'bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      {v.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight leading-tight whitespace-nowrap">
                  {v.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute bottom-0.5 w-4 h-0.5 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

