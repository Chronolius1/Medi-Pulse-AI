import { LineChart, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { useAppDispatch, useAppState } from '../../hooks/useApp';
import { buildTrendSeries, buildTrendStats } from '../../lib/trends';
import { selectActiveMarker, selectAvailableMarkers } from '../../state/selectors';
import { Card, EmptyState, SectionHeader, Select } from '../ui';
import { ComparisonTable } from './ComparisonTable';
import { StatTiles } from './StatTiles';
import { TrendChart } from './TrendChart';

export function TrendsTab() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const markers = selectAvailableMarkers(state);
  const activeMarker = selectActiveMarker(state);

  const series = useMemo(
    () =>
      activeMarker
        ? buildTrendSeries(state.records, activeMarker)
        : { points: [], unit: '', min: null, max: null },
    [state.records, activeMarker],
  );
  const stats = useMemo(() => buildTrendStats(series), [series]);

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-4">
        <SectionHeader
          icon={<TrendingUp className="h-4 w-4 text-blue-400" aria-hidden />}
          title="Biomarker trajectory"
          action={
            markers.length > 0 ? (
              <div className="flex items-center gap-2">
                <label htmlFor="trend-marker" className="sr-only">
                  Biomarker to plot
                </label>
                <Select
                  id="trend-marker"
                  value={activeMarker ?? ''}
                  onChange={(e) =>
                    dispatch({ type: 'trends/setMarker', marker: e.target.value })
                  }
                  className="w-auto py-1 text-xs"
                >
                  {markers.map((marker) => (
                    <option key={marker} value={marker}>
                      {marker}
                    </option>
                  ))}
                </Select>
              </div>
            ) : undefined
          }
        />

        {markers.length === 0 || !activeMarker ? (
          <EmptyState
            icon={<LineChart className="h-7 w-7" aria-hidden />}
            title="No trend data yet"
            body="Process at least one report — or load the 3-visit demo from the Intake tab — to chart biomarker movement over time."
          />
        ) : (
          <>
            <StatTiles stats={stats} />
            <div className="h-64 sm:h-72">
              {/* Keyed on the marker so a switch remounts cleanly rather than
                  animating between two unrelated scales. */}
              <TrendChart key={activeMarker} series={series} marker={activeMarker} />
            </div>
          </>
        )}
      </Card>

      <Card className="space-y-4 p-4">
        <SectionHeader
          icon={<LineChart className="h-4 w-4 text-blue-400" aria-hidden />}
          title="Longitudinal comparison"
        />
        <ComparisonTable />
      </Card>
    </div>
  );
}
