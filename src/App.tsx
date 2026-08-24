/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Act, FestivalDay, PriorityLevel, UserActPreference } from './types';
import { Header } from './components/Header';
import { ViewNav, ViewMode } from './components/ViewNav';
import { TimetableGrid } from './components/TimetableGrid';
import { MyItineraryView } from './components/MyItineraryView';
import { ClashSolverView } from './components/ClashSolverView';
import { LineupExplorer } from './components/LineupExplorer';
import { StageMapView } from './components/StageMapView';
import { ActDetailModal } from './components/ActDetailModal';
import { detectClashes } from './utils/scheduleUtils';
import { FESTIVAL_ACTS } from './data/festivalData';

const STORAGE_KEY = 'ep_2026_user_preferences';

export default function App() {
  const [activeDay, setActiveDay] = useState<FestivalDay>('friday');
  const [activeView, setActiveView] = useState<ViewMode>('timetable');
  const [activeActModal, setActiveActModal] = useState<Act | null>(null);

  // Load preferences from localStorage with fallback to empty schedule
  const [userPreferences, setUserPreferences] = useState<
    Record<string, UserActPreference | PriorityLevel>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading preferences from localStorage:', e);
    }
    return {};
  });

  // Save to localStorage whenever userPreferences changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userPreferences));
    } catch (e) {
      console.error('Error saving preferences to localStorage:', e);
    }
  }, [userPreferences]);

  // Priority Update handler
  const handleUpdatePriority = (actId: string, priority: PriorityLevel) => {
    setUserPreferences((prev) => {
      const current = prev[actId];
      if (priority === 'none') {
        const next = { ...prev };
        delete next[actId];
        return next;
      }
      if (typeof current === 'object' && current !== null) {
        return {
          ...prev,
          [actId]: {
            ...current,
            priority,
          },
        };
      }
      return {
        ...prev,
        [actId]: priority,
      };
    });
  };

  // Notes update handler
  const handleUpdateNotes = (actId: string, notes: string) => {
    setUserPreferences((prev) => {
      const current = prev[actId];
      const priority = typeof current === 'string' ? current : current?.priority || 'must_see';
      return {
        ...prev,
        [actId]: {
          actId,
          priority,
          notes,
        },
      };
    });
  };

  // Clear all selections
  const handleClearPreferences = () => {
    if (confirm('Are you sure you want to clear your entire festival shortlist?')) {
      setUserPreferences({});
    }
  };

  // Detect clashes for current active day
  const dayClashes = useMemo(() => {
    return detectClashes(userPreferences, activeDay);
  }, [userPreferences, activeDay]);

  // Detect total clashes across all days
  const allClashes = useMemo(() => {
    return detectClashes(userPreferences);
  }, [userPreferences]);

  // Compute metrics
  const { totalSelectedCount, mustSeeCount } = useMemo(() => {
    let selected = 0;
    let mustSee = 0;
    Object.values(userPreferences).forEach((pref) => {
      const priority = typeof pref === 'string' ? pref : (pref as UserActPreference | undefined)?.priority;
      if (priority && priority !== 'none') {
        selected++;
        if (priority === 'must_see') mustSee++;
      }
    });
    return { totalSelectedCount: selected, mustSeeCount: mustSee };
  }, [userPreferences]);

  const currentDaySelectedCount = useMemo(() => {
    return FESTIVAL_ACTS.filter((act) => {
      if (act.day !== activeDay) return false;
      const pref = userPreferences[act.id];
      const priority = typeof pref === 'string' ? pref : pref?.priority;
      return priority && priority !== 'none';
    }).length;
  }, [userPreferences, activeDay]);

  return (
    <div id="ep-app-container" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Header */}
      <Header
        activeDay={activeDay}
        onSelectDay={setActiveDay}
        userPreferences={userPreferences}
        onClearPreferences={handleClearPreferences}
        clashesCount={dayClashes.length}
        totalSelectedCount={totalSelectedCount}
        mustSeeCount={mustSeeCount}
      />

      {/* Main View Navigation Tabs */}
      <ViewNav
        activeView={activeView}
        onSelectView={setActiveView}
        clashesCount={dayClashes.length}
        selectedActsCount={currentDaySelectedCount}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 flex flex-col">
        {activeView === 'timetable' && (
          <TimetableGrid
            day={activeDay}
            userPreferences={userPreferences}
            onUpdatePriority={handleUpdatePriority}
            onOpenActDetail={setActiveActModal}
            clashes={dayClashes}
          />
        )}

        {activeView === 'itinerary' && (
          <MyItineraryView
            day={activeDay}
            onSelectDay={setActiveDay}
            userPreferences={userPreferences}
            onUpdatePriority={handleUpdatePriority}
            onUpdateNotes={handleUpdateNotes}
            onOpenActDetail={setActiveActModal}
            clashes={dayClashes}
            allClashes={allClashes}
          />
        )}

        {activeView === 'clashes' && (
          <ClashSolverView
            day={activeDay}
            clashes={dayClashes}
            userPreferences={userPreferences}
            onUpdatePriority={handleUpdatePriority}
            onUpdateNotes={handleUpdateNotes}
            onOpenActDetail={setActiveActModal}
          />
        )}

        {activeView === 'explorer' && (
          <LineupExplorer
            dayFilter={activeDay}
            onSelectDay={setActiveDay}
            userPreferences={userPreferences}
            onUpdatePriority={handleUpdatePriority}
            onOpenActDetail={setActiveActModal}
          />
        )}

        {activeView === 'map' && (
          <StageMapView
            day={activeDay}
            onOpenActDetail={setActiveActModal}
          />
        )}
      </main>

      {/* Act Detail Modal Drawer */}
      {activeActModal && (
        <ActDetailModal
          act={activeActModal}
          onClose={() => setActiveActModal(null)}
          userPreferences={userPreferences}
          onUpdatePriority={handleUpdatePriority}
          onUpdateNotes={handleUpdateNotes}
          clashes={allClashes}
        />
      )}
    </div>
  );
}
