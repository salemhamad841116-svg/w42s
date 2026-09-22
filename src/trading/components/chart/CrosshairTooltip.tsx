import React from 'react';
import clsx from 'clsx';

interface CrosshairData {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  visible: boolean;
}

interface CrosshairTooltipProps {
  data: CrosshairData;
}

export const CrosshairTooltip: React.FC<CrosshairTooltipProps> = ({ data }) => {
  if (!data.visible) return null;

  const isUp = data.close >= data.open;
  const colorClass = isUp ? 'text-[#00C087]' : 'text-[#F23645]';

  const formatPrice = (p: number) => p.toFixed(2);
  const formatVol = (v: number) => v.toFixed(2);

  return (
    <div className="absolute top-2 left-2 z-10 pointer-events-none flex gap-3 text-xs font-mono bg-[#0B0E14]/80 p-1.5 rounded border border-[#262B3D]">
      <span className="text-[#8F9CAE]">O <span className={colorClass}>{formatPrice(data.open)}</span></span>
      <span className="text-[#8F9CAE]">H <span className={colorClass}>{formatPrice(data.high)}</span></span>
      <span className="text-[#8F9CAE]">L <span className={colorClass}>{formatPrice(data.low)}</span></span>
      <span className="text-[#8F9CAE]">C <span className={colorClass}>{formatPrice(data.close)}</span></span>
      <span className="text-[#8F9CAE]">Vol <span className="text-white">{formatVol(data.volume)}</span></span>
    </div>
  );
};
