import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  type ScriptableContext,
  type TooltipItem,
} from 'chart.js';
import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { TrendSeries } from '../../lib/trends';
import { STATUS_STYLES } from '../ui/statusStyles';

// Registered explicitly rather than via chart.js/auto to keep the chunk small.
// Filler is required for `fill: true` — omitting it silently drops the gradient.
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
);

/**
 * Biomarker trajectory. Ported from `renderTrendChart` (med.js:805-1040).
 *
 * The manual `new Chart()` / `.destroy()` cycle is gone — react-chartjs-2 owns
 * the instance. `data` and `options` are memoised because the library calls
 * `chart.update()` whenever their identity changes, which would otherwise
 * restart the animation on every parent render.
 */
export function TrendChart({
  series,
  marker,
}: {
  series: TrendSeries;
  marker: string;
}) {
  const { points, unit, min, max } = series;

  const data = useMemo(() => {
    const labels = points.map((p) => p.date);
    const values = points.map((p) => p.value);

    const pointColors = points.map((p) =>
      p.status ? STATUS_STYLES[p.status].hex : '#64748b',
    );

    const datasets: Parameters<typeof Line>[0]['data']['datasets'] = [
      {
        label: `${marker}${unit ? ` (${unit})` : ''}`,
        data: values,
        borderColor: '#3b82f6',
        borderWidth: 2.5,
        tension: 0.45,
        fill: true,
        spanGaps: true,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 7,
        pointHoverRadius: 10,
        backgroundColor: (ctx: ScriptableContext<'line'>) => {
          const { chart } = ctx;
          const { ctx: canvasCtx, chartArea } = chart;
          // chartArea is undefined on the very first paint; returning a solid
          // transparent avoids the throw the imperative version was prone to.
          if (!chartArea) return 'rgba(59, 130, 246, 0)';
          const gradient = canvasCtx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
          gradient.addColorStop(0.6, 'rgba(59, 130, 246, 0.06)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return gradient;
        },
      },
    ];

    if (max !== null) {
      datasets.push({
        label: 'Upper limit',
        data: labels.map(() => max),
        borderColor: 'rgba(248, 113, 113, 0.55)',
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        fill: false,
      });
    }
    if (min !== null) {
      datasets.push({
        label: 'Lower limit',
        data: labels.map(() => min),
        borderColor: 'rgba(251, 191, 36, 0.55)',
        borderWidth: 1.5,
        borderDash: [5, 4],
        pointRadius: 0,
        fill: false,
      });
    }

    return { labels, datasets };
  }, [points, marker, unit, min, max]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: 'easeInOutQuart' as const },
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          position: 'top' as const,
          align: 'end' as const,
          labels: {
            color: '#94a3b8',
            boxWidth: 10,
            boxHeight: 10,
            font: { size: 10 },
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: '#1e293b',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 10,
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          callbacks: {
            title: (items: TooltipItem<'line'>[]) => `Visit: ${items[0]?.label ?? ''}`,
            label: (item: TooltipItem<'line'>) => {
              const value = item.parsed.y;
              if (value === null || item.datasetIndex !== 0) {
                return `${item.dataset.label}: ${value}`;
              }
              let suffix = '';
              if (max !== null && value > max) suffix = '  ▲ HIGH';
              else if (min !== null && value < min) suffix = '  ▼ LOW';
              return `${marker}: ${value} ${unit}${suffix}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748b', font: { size: 10 } },
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { color: '#64748b', font: { size: 10 } },
        },
      },
    }),
    [marker, unit, min, max],
  );

  return <Line data={data} options={options} />;
}
