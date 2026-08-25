import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Palette,
  Calendar,
  User,
  CheckSquare,
  Square,
  Eye,
  Download,
  Sparkles,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { ClashDetail, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { PrintableItineraryDocument, PrintSettings } from './PrintableItineraryDocument';

interface PrintPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  clashes: ClashDetail[];
  initialDay?: FestivalDay | 'all';
}

export const PrintPdfModal: React.FC<PrintPdfModalProps> = ({
  isOpen,
  onClose,
  userPreferences,
  clashes,
  initialDay = 'all',
}) => {
  const [settings, setSettings] = useState<PrintSettings>({
    format: 'pocket_pass',
    colorMode: 'vibrant',
    dayScope: initialDay,
    attendeeName: 'My EP \'26 Itinerary',
    showNotes: true,
    showWalkingTimes: true,
    showFestivalEssentials: true,
    showClashes: true,
  });

  const [previewScale, setPreviewScale] = useState<number>(0.9);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    // Small delay to allow any pending DOM updates then invoke native browser print dialog
    setTimeout(() => {
      window.print();
    }, 50);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Print to PDF • Festival Pocket Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready to Print / PDF
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Customize your festival itinerary for printing or saving as a PDF pocket guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Body: Controls & Settings on Left, Live Paper Preview on Right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Settings Panel */}
          <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-neutral-800 p-4 sm:p-5 overflow-y-auto space-y-5 bg-neutral-900/90 shrink-0">
            {/* Format Style */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Layout Format</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, format: 'pocket_pass' }))}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    settings.format === 'pocket_pass'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-md'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold">Pocket Pass & Booklet</div>
                  <div className={`text-[10px] mt-0.5 ${settings.format === 'pocket_pass' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Foldable 2-column festival pass
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, format: 'timeline_poster' }))}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    settings.format === 'timeline_poster'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-md'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold">Timeline Poster</div>
                  <div className={`text-[10px] mt-0.5 ${settings.format === 'timeline_poster' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Chronological schedule rows
                  </div>
                </button>
              </div>
            </div>

            {/* Color Palette Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Color &amp; Theme</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, colorMode: 'vibrant' }))}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    settings.colorMode === 'vibrant'
                      ? 'bg-linear-to-r from-purple-900 to-amber-900 text-white font-bold border-amber-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-linear-to-r from-amber-400 to-rose-500 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">Festival Vibrant</div>
                    <div className="text-[9px] text-neutral-400">Festival color poster</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, colorMode: 'eco' }))}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    settings.colorMode === 'eco'
                      ? 'bg-white text-neutral-950 font-bold border-neutral-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-neutral-300 border border-neutral-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px]">Ink Saver (Eco)</div>
                    <div className="text-[9px] text-neutral-500">Clean white paper</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Days Scope */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Days to Include</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, dayScope: 'all' }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'all'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  All Days
                </button>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, dayScope: 'thursday' }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'thursday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Thursday
                </button>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, dayScope: 'friday' }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'friday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Friday
                </button>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, dayScope: 'saturday' }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'saturday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Saturday
                </button>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, dayScope: 'sunday' }))}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'sunday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Sunday
                </button>
              </div>
            </div>

            {/* Personalized Pass Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Passholder / Crew Name</span>
              </label>
              <input
                type="text"
                value={settings.attendeeName}
                onChange={(e) => setSettings((s) => ({ ...s, attendeeName: e.target.value }))}
                placeholder="e.g. Sarah's EP '26 Guide"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Checklist Options */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Included Details</span>
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showNotes}
                    onChange={(e) => setSettings((s) => ({ ...s, showNotes: e.target.checked }))}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Include personal act notes</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showWalkingTimes}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, showWalkingTimes: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Include stage walking times &amp; distance cheat sheet</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showFestivalEssentials}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, showFestivalEssentials: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Include festival essentials &amp; safety tips</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showClashes}
                    onChange={(e) => setSettings((s) => ({ ...s, showClashes: e.target.checked }))}
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Include stage time clash alerts</span>
                </label>
              </div>
            </div>

            {/* Print Help Guide */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Printing Tip
              </div>
              <p>
                In the browser print dialog, choose <strong>"Save as PDF"</strong> as your destination. For best results, ensure <strong>"Background graphics"</strong> is checked.
              </p>
            </div>
          </div>

          {/* Right Column: Live Interactive Paper Preview */}
          <div className="flex-1 bg-neutral-950 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-start">
            {/* Preview Toolbar */}
            <div className="w-full max-w-3xl flex items-center justify-between mb-3 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-200">Live Print / PDF Preview</span>
                <span className="text-neutral-600">•</span>
                <span>Standard A4 / Letter format</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(0.6, s - 0.1))}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-neutral-300 font-bold"
                >
                  -
                </button>
                <span className="px-1 text-[11px]">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-neutral-300 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Paper Sheet Preview Container */}
            <div
              className="w-full max-w-3xl origin-top transition-transform duration-150"
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
              }}
            >
              <PrintableItineraryDocument
                settings={settings}
                userPreferences={userPreferences}
                clashes={clashes}
                id="festival-print-preview-sheet"
                isPdfPreview={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
