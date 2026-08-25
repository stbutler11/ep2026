import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Palette,
  Calendar,
  User,
  Eye,
  Download,
  Sparkles,
  Sliders,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Layers,
} from 'lucide-react';
import { toJpeg, toPng } from 'html-to-image';
import { ClashDetail, FestivalDay, PriorityLevel, UserActPreference } from '../types';
import { PrintableItineraryDocument, PrintSettings } from './PrintableItineraryDocument';

interface PrintPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPreferences: Record<string, UserActPreference | PriorityLevel>;
  clashes: ClashDetail[];
  initialDay?: FestivalDay | 'all';
  settings: PrintSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<PrintSettings>>;
}

export const PrintPdfModal: React.FC<PrintPdfModalProps> = ({
  isOpen,
  onClose,
  userPreferences,
  clashes,
  initialDay = 'all',
  settings,
  onUpdateSettings,
}) => {
  const [previewScale, setPreviewScale] = useState<number>(0.9);
  const [isExportingJpeg, setIsExportingJpeg] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    // Small delay to ensure any pending state renders in DOM before invoking native browser print dialog
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportJpeg = async () => {
    try {
      setIsExportingJpeg(true);
      setExportSuccess(false);

      const previewElement = document.getElementById('festival-print-preview-sheet');
      if (!previewElement) {
        throw new Error('Preview element not found');
      }

      // Temporarily ensure full opacity and standard render for canvas capture
      const dataUrl = await toJpeg(previewElement, {
        quality: 0.95,
        backgroundColor: settings.colorMode === 'eco' ? '#ffffff' : '#0a0a0a',
        pixelRatio: 2.5, // Crisp high-res for zoom and printing
        cacheBust: true,
      });

      const downloadLink = document.createElement('a');
      const safeAttendee = (settings.attendeeName || 'EP2026_Schedule').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${safeAttendee}_${settings.dayScope}_${settings.density}.jpg`;

      downloadLink.download = filename;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (error) {
      console.error('Failed to export JPEG:', error);
      alert('Unable to export JPEG. You can also use the "Print / Save as PDF" option.');
    } finally {
      setIsExportingJpeg(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  Festival Itinerary • PDF &amp; JPEG Export
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready to Export
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Custom festival pocket guide formatted for A4 printing, PDF saving, or High-Res JPEG wallpaper
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Export as JPEG Button */}
            <button
              onClick={handleExportJpeg}
              disabled={isExportingJpeg}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold text-xs sm:text-sm border border-neutral-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Save as a high-resolution JPEG image (great for phone lock screen or sharing)"
            >
              {isExportingJpeg ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Generating JPEG...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">JPEG Downloaded!</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>Save as JPEG</span>
                </>
              )}
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handleTriggerPrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 active:scale-95"
              title="Open browser print dialog to print or save as A4 PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors ml-auto sm:ml-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2-Column Body: Controls & Settings on Left, Live Paper Preview on Right */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Settings Panel */}
          <div className="w-full lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-neutral-800 p-4 sm:p-5 overflow-y-auto space-y-4 bg-neutral-900/90 shrink-0">
            {/* Personalized Pass Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Passholder / Crew Name</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-normal">Shown on header pass</span>
              </label>
              <input
                type="text"
                value={settings.attendeeName}
                onChange={(e) =>
                  onUpdateSettings((s) => ({ ...s, attendeeName: e.target.value }))
                }
                placeholder="e.g. Sarah's EP '26 Guide"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-hidden focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Density & Size Mode */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Layout Density</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-normal">Scale content to fit</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, density: 'compact' }))}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    settings.density === 'compact'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-bold text-[11px]">Compact</div>
                  <div className={`text-[9px] ${settings.density === 'compact' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Phone / Pocket
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, density: 'standard' }))}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    settings.density === 'standard'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-bold text-[11px]">Standard</div>
                  <div className={`text-[9px] ${settings.density === 'standard' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Standard A4
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, density: 'spacious' }))}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    settings.density === 'spacious'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-bold text-[11px]">Spacious</div>
                  <div className={`text-[9px] ${settings.density === 'spacious' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Poster
                  </div>
                </button>
              </div>
            </div>

            {/* Color Palette Mode / Ink Saver */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Color Theme</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-normal">Ink vs Poster</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, colorMode: 'vibrant' }))}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    settings.colorMode === 'vibrant'
                      ? 'bg-linear-to-r from-purple-900/90 to-amber-900/90 text-white font-bold border-amber-400 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-linear-to-r from-amber-400 to-rose-500 shrink-0 shadow-xs" />
                  <div>
                    <div className="font-bold text-[11px]">Festival Sunset</div>
                    <div className="text-[9px] text-neutral-400">Dark / Vibrant</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, colorMode: 'eco' }))}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                    settings.colorMode === 'eco'
                      ? 'bg-white text-neutral-950 font-bold border-amber-500 shadow-sm ring-2 ring-amber-500/20'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-neutral-200 border border-neutral-400 shrink-0" />
                  <div>
                    <div className="font-bold text-[11px] text-neutral-950 dark:text-white">Ink Saver (Eco)</div>
                    <div className="text-[9px] text-neutral-500">Clean White Paper</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Layout Format (Pocket vs Timeline) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Layout Style</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, format: 'pocket_pass' }))}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    settings.format === 'pocket_pass'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">2-Column Booklet</div>
                  <div className={`text-[9px] ${settings.format === 'pocket_pass' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Foldable pocket pass
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, format: 'timeline_poster' }))}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    settings.format === 'timeline_poster'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400 shadow-xs'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-[11px]">Timeline Rows</div>
                  <div className={`text-[9px] ${settings.format === 'timeline_poster' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Chronological schedule
                  </div>
                </button>
              </div>
            </div>

            {/* Days Scope */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Days to Include</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, dayScope: 'all' }))}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'all'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  All Days
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, dayScope: 'thursday' }))}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'thursday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Thu
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, dayScope: 'friday' }))}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'friday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Fri
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, dayScope: 'saturday' }))}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'saturday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Sat
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, dayScope: 'sunday' }))}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    settings.dayScope === 'sunday'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  Sun
                </button>
              </div>
            </div>

            {/* Page Break Splitting for Print/PDF */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>A4 Page Splitting</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-normal">Clean multi-page breaks</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, pageBreaks: 'per_day' }))}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    settings.pageBreaks === 'per_day'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-bold text-[11px]">1 Day Per Page</div>
                  <div className={`text-[9px] ${settings.pageBreaks === 'per_day' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Fresh page for each day
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings((s) => ({ ...s, pageBreaks: 'continuous' }))}
                  className={`p-2 rounded-xl border text-center text-xs transition-all ${
                    settings.pageBreaks === 'continuous'
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-bold text-[11px]">Continuous Flow</div>
                  <div className={`text-[9px] ${settings.pageBreaks === 'continuous' ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    Compact paper usage
                  </div>
                </button>
              </div>
            </div>

            {/* Checklist Inclusions */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Included Details
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showClashes}
                    onChange={(e) =>
                      onUpdateSettings((s) => ({ ...s, showClashes: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Show specific clashing acts &amp; stages</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showNotes}
                    onChange={(e) =>
                      onUpdateSettings((s) => ({ ...s, showNotes: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Include personal act notes</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showWalkingTimes}
                    onChange={(e) =>
                      onUpdateSettings((s) => ({ ...s, showWalkingTimes: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Include walking times &amp; cheat sheet</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showFestivalEssentials}
                    onChange={(e) =>
                      onUpdateSettings((s) => ({
                        ...s,
                        showFestivalEssentials: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Include festival essentials &amp; safety tips</span>
                </label>
              </div>
            </div>

            {/* Quick Export Tips */}
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Export Tips
              </div>
              <p>
                • <strong>Save as JPEG</strong> downloads a high-res image directly to your device (ideal for offline phone wallpapers).
              </p>
              <p>
                • <strong>Print / PDF</strong> opens the print window — select <em>"Save as PDF"</em> and check <em>"Background graphics"</em>.
              </p>
            </div>
          </div>

          {/* Right Column: Live Interactive Paper Preview */}
          <div className="flex-1 bg-neutral-950 p-3 sm:p-5 overflow-y-auto flex flex-col items-center justify-start">
            {/* Preview Toolbar */}
            <div className="w-full max-w-3xl flex items-center justify-between mb-3 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-200">Live Export Preview</span>
                <span className="text-neutral-600">•</span>
                <span className="text-[11px] text-amber-400 font-medium">
                  {settings.colorMode === 'eco' ? 'Ink Saver Paper' : 'Festival Vibrant Poster'}
                  {settings.density === 'compact' ? ' (Compact Mode)' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.max(0.5, s - 0.1))}
                  className="px-2 py-0.5 hover:bg-neutral-800 rounded text-neutral-300 font-bold"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="px-1.5 text-[10px] font-mono">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale((s) => Math.min(1.2, s + 0.1))}
                  className="px-2 py-0.5 hover:bg-neutral-800 rounded text-neutral-300 font-bold"
                  title="Zoom In"
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
