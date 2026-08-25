import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Share2,
  AlertTriangle,
  Flame,
  Star,
  Trash2,
  ChevronDown,
  Check,
  Music,
  MapPin,
  Printer,
} from 'lucide-react';
import { FestivalDay, PriorityLevel } from '../types';
import { formatItineraryText, generateICS } from '../utils/scheduleUtils';
import confetti from 'canvas-confetti';

interface HeaderProps {
  activeDay: FestivalDay;
  onSelectDay: (day: FestivalDay) => void;
  userPreferences: Record<string, any>;
  onClearPreferences: () => void;
  onOpenPrintModal: () => void;
  clashesCount: number;
  totalSelectedCount: number;
  mustSeeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeDay,
  onSelectDay,
  userPreferences,
  onClearPreferences,
  onOpenPrintModal,
  clashesCount,
  totalSelectedCount,
  mustSeeCount,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const days: { id: FestivalDay; label: string; date: string }[] = [
    { id: 'thursday', label: 'Thursday', date: 'Aug 27' },
    { id: 'friday', label: 'Friday', date: 'Aug 28' },
    { id: 'saturday', label: 'Saturday', date: 'Aug 29' },
    { id: 'sunday', label: 'Sunday', date: 'Aug 30' },
  ];

  const handleExportICS = () => {
    const icsContent = generateICS(userPreferences);
    if (!icsContent) {
      alert('Please add at least one act to your schedule before exporting!');
      return;
    }
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Electric_Picnic_2026_Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.2 },
    });
  };

  const handleCopyItinerary = () => {
    const text = formatItineraryText(userPreferences);
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
      setShowExportMenu(false);
    }, 2000);
  };

  return (
    <header id="main-festival-header" className="bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-30">
      {/* Top Banner with Festival Branding & Quick Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2.5 sm:pt-3.5 pb-2 sm:pb-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-white truncate">
                  Electric Picnic <span className="text-amber-400 font-extrabold">'26</span>
                </h1>
                <span className="hidden xs:inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate hidden xs:flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                <span>Stradbally Hall</span>
                <span className="text-neutral-600">•</span>
                <span>Aug 28–30</span>
              </p>
            </div>
          </div>

          {/* Schedule Status & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Stats Badges */}
            <div className="flex items-center gap-1.5 bg-neutral-950/80 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-neutral-800 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1 text-neutral-300 font-medium" title="Total saved acts">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 fill-emerald-400/20" />
                <span>{totalSelectedCount}</span>
                <span className="hidden sm:inline">saved</span>
              </div>
              <span className="text-neutral-700">|</span>
              <div className="flex items-center gap-1 text-amber-300 font-medium" title="Must see acts">
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400/20" />
                <span>{mustSeeCount}</span>
                <span className="hidden sm:inline">must-see</span>
              </div>
              {clashesCount > 0 && (
                <>
                  <span className="text-neutral-700">|</span>
                  <div className="flex items-center gap-1 text-rose-400 font-bold animate-pulse" title="Stage time clashes">
                    <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{clashesCount}</span>
                    <span className="hidden sm:inline">clash{clashesCount > 1 ? 'es' : ''}</span>
                  </div>
                </>
              )}
            </div>

            {/* Clear All Selections Button (when items selected) */}
            {totalSelectedCount > 0 && (
              <button
                id="clear-shortlist-btn"
                onClick={onClearPreferences}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800/80 hover:bg-rose-950/40 text-xs font-medium text-neutral-300 hover:text-rose-300 transition-colors border border-neutral-700/60 hover:border-rose-800/60 flex items-center gap-1"
                title="Clear all saved acts"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden md:inline">Reset</span>
              </button>
            )}

            {/* Export & Share Menu */}
            <div className="relative">
              <button
                id="export-share-btn"
                onClick={() => {
                  setShowExportMenu(!showExportMenu);
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[11px] sm:text-xs font-bold transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-neutral-900" />
              </button>

              {showExportMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:hidden"
                    onClick={() => setShowExportMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 max-w-[90vw] bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50">
                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        onOpenPrintModal();
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-800 active:bg-neutral-800 transition-colors flex items-center gap-2.5 text-xs text-neutral-200 group border-b border-neutral-800/80 pb-2.5 mb-1"
                    >
                      <Printer className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div>
                        <div className="font-semibold text-neutral-100 flex items-center gap-1.5">
                          <span>Print to PDF / Pocket Guide</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            Festival Pass
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400">Foldable festival pass &amp; schedule sheet</div>
                      </div>
                    </button>

                    <button
                      onClick={handleExportICS}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-800 active:bg-neutral-800 transition-colors flex items-center gap-2.5 text-xs text-neutral-200 group"
                    >
                      <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                      <div>
                        <div className="font-semibold text-neutral-100">Export to Calendar (.ICS)</div>
                        <div className="text-[10px] text-neutral-400">Apple Calendar, Google, Outlook</div>
                      </div>
                    </button>

                    <button
                      onClick={handleCopyItinerary}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-neutral-800 active:bg-neutral-800 transition-colors flex items-center gap-2.5 text-xs text-neutral-200 group mt-1"
                    >
                      {copiedNotification ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Share2 className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-neutral-100">
                          {copiedNotification ? 'Copied to Clipboard!' : 'Copy WhatsApp / Text Itinerary'}
                        </div>
                        <div className="text-[10px] text-neutral-400">Formatted schedule for group chats</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Day Selector Tabs (Smooth touch carousel on mobile) */}
        <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-0.5">
            {days.map((day) => {
              const isActive = activeDay === day.id;
              return (
                <button
                  key={day.id}
                  id={`day-tab-${day.id}`}
                  onClick={() => onSelectDay(day.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-950 shadow-md font-bold'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                  }`}
                >
                  <Calendar className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-neutral-400'}`} />
                  <span>{day.label}</span>
                  <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${isActive ? 'bg-neutral-200 text-neutral-800 font-semibold' : 'bg-neutral-900 text-neutral-500'}`}>
                    {day.date}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 shrink-0 pl-4">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Festival Hours: 12:00 PM – Late (04:00 AM+)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
