import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  createChart,
  CandlestickSeries,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
} from 'lightweight-charts';
import { CrosshairTooltip } from './CrosshairTooltip';
import { PriceScaleActions } from './PriceScaleActions';
import { OrderLineOverlay } from './OrderLineOverlay';
import { DrawingCanvasOverlay } from './DrawingCanvasOverlay';
import { ChartCanvasContextMenu } from './ChartCanvasContextMenu';
import { AIMarkerOverlay } from './AIMarkerOverlay';
import { useChartStore } from '../../store';
import { liveMarketService } from '../../services/liveMarketService';

interface CrosshairData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  x: number;
  y: number;
  visible: boolean;
}

export const ChartWidget: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [chartReady, setChartReady] = useState(false);

  const activeSymbol = useChartStore((state) => state.activeSymbol) || 'BTC/USDT';
  const activeResolution = useChartStore((state) => state.activeResolution) || '15';

  const [crosshair, setCrosshair] = useState<CrosshairData>({
    time: 0, open: 0, high: 0, low: 0, close: 0, volume: 0, x: 0, y: 0, visible: false
  });

  // 10-Second Inactivity Auto-Reset Timer Ref
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChartModified = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      if (chartRef.current) {
        // Revert to default rightOffset = 5 and autoScale = true
        chartRef.current.timeScale().applyOptions({
          rightOffset: 5,
        });
        chartRef.current.priceScale('right').applyOptions({
          autoScale: true,
          scaleMargins: {
            top: 0.08,
            bottom: 0.08,
          },
        });
      }

      // Also reset TradingView Widget if present
      const win = window as any;
      if (win.tvWidget && win.tvWidget.chart) {
        try {
          win.tvWidget.chart().applyOptions({ rightOffset: 5 });
        } catch (e) {}
      }
    }, 10000); // 10 seconds
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      const chart = createChart(chartContainerRef.current, {
        layout: { background: { color: '#0B0E14' }, textColor: '#8F9CAE' },
        grid: { vertLines: { color: '#1E2336' }, horzLines: { color: '#1E2336' } },
        rightPriceScale: {
          borderColor: '#262B3D',
          scaleMargins: {
            top: 0.08,
            bottom: 0.08,
          },
        },
        timeScale: {
          borderColor: '#262B3D',
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 5,
        },
        crosshair: { mode: CrosshairMode.Normal, vertLine: { color: '#262B3D' }, horzLine: { color: '#262B3D' } },
        width: chartContainerRef.current.clientWidth || 800,
        height: chartContainerRef.current.clientHeight || 500,
      });

      chartRef.current = chart;

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#00C087',
        downColor: '#F23645',
        borderUpColor: '#00C087',
        borderDownColor: '#F23645',
        wickUpColor: '#00C087',
        wickDownColor: '#F23645',
      });
      seriesRef.current = candlestickSeries;

      // Fetch real historical candles and subscribe to live candle updates
      liveMarketService.setActiveSymbol(activeSymbol);
      liveMarketService.setActiveResolution(activeResolution);

      let isMounted = true;
      liveMarketService.fetchHistoricalCandles(activeSymbol, activeResolution, 200).then((candles) => {
        if (!isMounted || !seriesRef.current) return;
        const formatted: CandlestickData[] = candles.map((c) => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        seriesRef.current.setData(formatted);
      });

      const unsubscribeCandle = liveMarketService.onCandle((candle) => {
        if (!seriesRef.current) return;
        seriesRef.current.update({
          time: candle.time as any,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      });

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(chartContainerRef.current);

      chart.subscribeCrosshairMove((param) => {
        if (!param.time || param.point === undefined || !param.seriesData.size) {
          setCrosshair((prev) => ({ ...prev, visible: false }));
          return;
        }
        const data = param.seriesData.get(candlestickSeries) as CandlestickData | undefined;
        if (data) {
          setCrosshair({
            time: param.time as number,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: 0,
            x: param.point.x,
            y: param.point.y,
            visible: true,
          });
        }
      });

      // Detect user zoom/pan/scroll modifications to trigger 10s auto-reset
      chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
        handleChartModified();
      });

      setChartReady(true);

      return () => {
        isMounted = false;
        unsubscribeCandle();
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        resizeObserver.disconnect();
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
        setChartReady(false);
      };
    } catch (err) {
      console.error("Failed to initialize chart:", err);
    }
  }, [activeSymbol, activeResolution, handleChartModified]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="absolute inset-0" />
      <CrosshairTooltip data={crosshair} />
      {chartReady && (
        <PriceScaleActions
          containerRef={chartContainerRef}
          chartApi={chartRef.current}
          chartSeries={seriesRef.current}
          onChartModified={handleChartModified}
        />
      )}
      {chartReady && seriesRef.current && (
        <OrderLineOverlay chartSeries={seriesRef.current} />
      )}
      {chartReady && (
        <DrawingCanvasOverlay
          chartApi={chartRef.current}
          chartSeries={seriesRef.current}
          containerRef={chartContainerRef}
        />
      )}
      {chartReady && (
        <ChartCanvasContextMenu
          containerRef={chartContainerRef}
          chartApi={chartRef.current}
          chartSeries={seriesRef.current}
          onResetView={handleChartModified}
        />
      )}
      {/* AI Trade Markers — renders arrows on candles where AI executed */}
      <AIMarkerOverlay series={seriesRef.current} />
    </div>
  );
};
