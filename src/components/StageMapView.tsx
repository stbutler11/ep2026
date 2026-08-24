import React, { useState } from 'react';
import {
  MapPin,
  Footprints,
  Compass,
  ArrowRight,
  Info,
  Clock,
  Music,
  Users,
} from 'lucide-react';
import { FestivalDay, Stage } from '../types';
import { FESTIVAL_ACTS, FESTIVAL_STAGES, getWalkingTime, WALKING_DISTANCES } from '../data/festivalData';

interface StageMapViewProps {
  day: FestivalDay;
  onOpenActDetail: (act: any) => void;
}

export const StageMapView: React.FC<StageMapViewProps> = ({
  day,
  onOpenActDetail,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('main_stage');
  const [routeStartId, setRouteStartId] = useState<string>('main_stage');
  const [routeEndId, setRouteEndId] = useState<string>('terminus');

  const selectedStage = FESTIVAL_STAGES.find((s) => s.id === selectedStageId) || FESTIVAL_STAGES[0];
  const routeCalculation = getWalkingTime(routeStartId, routeEndId);
  const startStage = FESTIVAL_STAGES.find((s) => s.id === routeStartId);
  const endStage = FESTIVAL_STAGES.find((s) => s.id === routeEndId);

  // Today's acts for the selected stage
  const stageTodayActs = FESTIVAL_ACTS.filter(
    (a) => a.stageId === selectedStage.id && a.day === day
  ).sort((a, b) => a.startMinutes - b.startMinutes);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Overview Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Stradbally Hall Festival Grounds &amp; Stage Map
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Co. Laois Estate Map
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Navigate between festival arenas, plan stage transitions, and check estimated walking times through the crowds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Interactive Map Canvas (Left 7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Interactive Stage Layout</span>
            </h3>
            <span className="text-[11px] text-neutral-400">Click a stage marker to view lineup</span>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full aspect-4/3 bg-neutral-950 rounded-xl border border-neutral-800/80 overflow-hidden select-none p-4 flex items-center justify-center">
            {/* Background Parkland / Wooded Areas Stylized SVG */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Forest Areas */}
              <circle cx="20%" cy="30%" r="80" fill="#065f46" opacity="0.4" />
              <circle cx="80%" cy="35%" r="90" fill="#065f46" opacity="0.4" />
              <circle cx="45%" cy="85%" r="100" fill="#065f46" opacity="0.3" />

              {/* Connecting Main Thoroughfare Paths */}
              <path
                d="M 120 280 Q 220 220 300 240 T 480 180"
                stroke="#525252"
                strokeWidth="6"
                strokeDasharray="4 4"
                fill="none"
              />
              <path
                d="M 300 240 Q 380 340 420 380 T 260 440"
                stroke="#525252"
                strokeWidth="5"
                strokeDasharray="4 4"
                fill="none"
              />
              <path
                d="M 300 240 L 400 120"
                stroke="#525252"
                strokeWidth="4"
                strokeDasharray="4 4"
                fill="none"
              />
            </svg>

            {/* Stage Location Nodes */}
            {FESTIVAL_STAGES.map((stage) => {
              const isSelected = selectedStage.id === stage.id;
              const isRouteStart = routeStartId === stage.id;
              const isRouteEnd = routeEndId === stage.id;

              return (
                <button
                  key={stage.id}
                  id={`map-pin-${stage.id}`}
                  onClick={() => setSelectedStageId(stage.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                    isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
                  }`}
                  style={{
                    left: `${stage.coordinates.x}%`,
                    top: `${stage.coordinates.y}%`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    {/* Marker Pin */}
                    <div
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-xl flex items-center gap-1.5 transition-all border ${
                        isSelected
                          ? 'ring-2 ring-white scale-105 shadow-amber-500/20'
                          : 'opacity-90 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: '#171717',
                        borderColor: stage.color,
                        color: stage.color,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full animate-pulse"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span>{stage.shortName}</span>
                    </div>

                    {/* Route Start/End Indicator */}
                    {(isRouteStart || isRouteEnd) && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded-full mt-1 ${
                          isRouteStart
                            ? 'bg-emerald-500 text-neutral-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {isRouteStart ? 'ROUTE START' : 'DESTINATION'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Walking Distance Route Calculator */}
          <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-3">
            <div className="text-xs font-bold text-neutral-300 flex items-center gap-2">
              <Footprints className="w-4 h-4 text-amber-400" />
              <span>Walking Time &amp; Transition Calculator</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-1">
                  Starting Stage:
                </label>
                <select
                  value={routeStartId}
                  onChange={(e) => setRouteStartId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-hidden focus:border-amber-500"
                >
                  {FESTIVAL_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 mb-1">
                  Destination Stage:
                </label>
                <select
                  value={routeEndId}
                  onChange={(e) => setRouteEndId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-hidden focus:border-amber-500"
                >
                  {FESTIVAL_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated Distance Result */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-200">{startStage?.shortName}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-semibold text-neutral-200">{endStage?.shortName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  ~{routeCalculation.minutes} mins walk
                </span>
                <span className="text-neutral-500">({routeCalculation.meters}m)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Stage Detail Panel (Right 5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col">
          <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedStage.color }}
                />
                <h3 className="text-lg font-bold text-white">
                  {selectedStage.name}
                </h3>
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Capacity: {selectedStage.capacity || 'Open Grounds'} • {selectedStage.category.toUpperCase()}
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {selectedStage.description}
          </p>

          {/* Today's Lineup for this stage */}
          <div className="space-y-2 pt-2 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>{day.charAt(0).toUpperCase() + day.slice(1)} Schedule:</span>
              </span>
              <span className="text-neutral-500">{stageTodayActs.length} acts</span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {stageTodayActs.length === 0 ? (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-xs text-neutral-500">
                  No acts scheduled on {selectedStage.shortName} on {day}.
                </div>
              ) : (
                stageTodayActs.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onOpenActDetail(act)}
                    className="p-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800/80 hover:border-neutral-700 transition-colors cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-200 group-hover:text-amber-300 transition-colors">
                        {act.name}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {act.genre}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold text-neutral-300">
                        {act.displayTime}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {act.durationMinutes}m
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
