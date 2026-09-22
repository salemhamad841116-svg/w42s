import { useEffect } from 'react';
import type { ISeriesApi, SeriesMarker, Time } from 'lightweight-charts';
import { useAIMarkersStore, type AIMarkerEntry } from '../../stores/useAIMarkersStore';
import { useChartStore } from '../../store';

/**
 * AIMarkerOverlay
 * 
 * Listens to the AI SSE stream, collects executed/ignored signals,
 * and renders triangle markers directly on the chart candlestick series
 * using the lightweight-charts Markers API.
 * 
 * Props:
 *   - series: The candlestick ISeriesApi reference from ChartWidget.
 */
interface AIMarkerOverlayProps {
  series: ISeriesApi<'Candlestick'> | null;
}

export const AIMarkerOverlay: React.FC<AIMarkerOverlayProps> = ({ series }) => {
  const { markers, showIgnored, addMarker } = useAIMarkersStore();
  const activeSymbol = useChartStore((s) => s.activeSymbol);

  // 1. Connect to SSE stream and populate the markers store
  useEffect(() => {
    const eventSource = new EventSource('/api/ai/stream');

    eventSource.onmessage = (event) => {
      try {
        const signal = JSON.parse(event.data);
        
        // Convert millisecond timestamp to seconds for chart alignment
        const timeInSeconds = Math.floor(signal.timestamp / 1000);

        addMarker({
          time: timeInSeconds,
          direction: signal.direction,
          confidence: signal.confidence,
          reason: signal.reason,
          symbol: signal.symbol,
          status: signal.status,
        });
      } catch (err) {
        // Silently ignore parse errors from heartbeat messages
      }
    };

    return () => {
      eventSource.close();
    };
  }, [addMarker]);

  // 2. Render markers on the chart whenever markers change
  useEffect(() => {
    if (!series) return;

    // Filter markers for the currently displayed symbol
    const relevantMarkers = markers.filter((m) => {
      if (m.symbol !== activeSymbol) return false;
      if (!showIgnored && m.status === 'IGNORED') return false;
      return true;
    });

    // Sort by time (required by lightweight-charts)
    relevantMarkers.sort((a, b) => a.time - b.time);

    // Convert to lightweight-charts marker format
    const chartMarkers: SeriesMarker<Time>[] = relevantMarkers.map((m) => {
      if (m.status === 'EXECUTED') {
        return {
          time: m.time as Time,
          position: m.direction === 'BUY' ? 'belowBar' : 'aboveBar',
          color: m.direction === 'BUY' ? '#00C087' : '#F23645',
          shape: m.direction === 'BUY' ? 'arrowUp' : 'arrowDown',
          text: `AI ${m.direction} ${m.confidence}%`,
        } as SeriesMarker<Time>;
      } else {
        // IGNORED — small circle marker (if showIgnored is enabled)
        return {
          time: m.time as Time,
          position: 'aboveBar',
          color: '#F0B90B',
          shape: 'circle',
          text: `Skip ${m.confidence}%`,
        } as SeriesMarker<Time>;
      }
    });

    try {
      series.setMarkers(chartMarkers);
    } catch (e) {
      // Series may not be ready yet
    }
  }, [series, markers, activeSymbol, showIgnored]);

  // This component renders nothing visible — it only drives marker data into the chart
  return null;
};
