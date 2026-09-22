import React, { useEffect, useRef } from 'react';
import { usePositionsStore } from '../../stores/positionsStore';
import type { ISeriesApi } from 'lightweight-charts';

interface OrderLineOverlayProps {
  chartSeries: ISeriesApi<"Candlestick"> | null;
}

export const OrderLineOverlay = React.memo(({ chartSeries }: OrderLineOverlayProps) => {
  const openOrders = usePositionsStore(state => state.openOrders) || [];
  const positions = usePositionsStore(state => state.positions) || [];
  const linesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!chartSeries) return;

    // Clean up existing lines safely
    linesRef.current.forEach(line => {
      try {
        chartSeries.removePriceLine(line);
      } catch (e) {}
    });
    linesRef.current = [];

    const safeAddLine = (opts: any) => {
      try {
        const line = chartSeries.createPriceLine(opts);
        if (line) linesRef.current.push(line);
      } catch (e) {
        // Silently catch if series was reset
      }
    };

    // Add order lines
    openOrders.forEach(order => {
      if (!order.price) return;
      const isBuy = order.side === 'BUY';
      safeAddLine({
        price: order.price,
        color: isBuy ? '#00C087' : '#F23645',
        lineStyle: 2,
        lineWidth: 1,
        title: `${order.side} limit`,
        axisLabelVisible: true,
      });
    });

    // Add position lines
    positions.forEach(pos => {
      if (!pos.entryPrice) return;
      safeAddLine({
        price: pos.entryPrice,
        color: '#F7931A',
        lineStyle: 0,
        lineWidth: 1,
        title: 'Entry',
        axisLabelVisible: true,
      });

      if (pos.takeProfitPrice) {
        safeAddLine({
          price: pos.takeProfitPrice,
          color: '#00C087',
          lineStyle: 3,
          lineWidth: 1,
          title: 'TP',
          axisLabelVisible: true,
        });
      }

      if (pos.stopLossPrice) {
        safeAddLine({
          price: pos.stopLossPrice,
          color: '#F23645',
          lineStyle: 3,
          lineWidth: 1,
          title: 'SL',
          axisLabelVisible: true,
        });
      }

      if (pos.liquidationPrice) {
        safeAddLine({
          price: pos.liquidationPrice,
          color: '#FF6D00',
          lineStyle: 0,
          lineWidth: 2,
          title: 'Liq',
          axisLabelVisible: true,
        });
      }
    });

    return () => {
      linesRef.current.forEach(line => {
        try { chartSeries.removePriceLine(line); } catch (e) {}
      });
      linesRef.current = [];
    };
  }, [chartSeries, openOrders, positions]);

  return null;
});
