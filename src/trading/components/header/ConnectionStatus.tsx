import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { liveMarketService } from '../../services/liveMarketService';

export const ConnectionStatus: React.FC = () => {
  const [latency, setLatency] = useState(24);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(liveMarketService.getLatency());
      setIsConnected(liveMarketService.getIsConnected());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!isConnected) return 'bg-[#F23645]';
    if (latency < 60) return 'bg-[#00C087]';
    if (latency < 150) return 'bg-[#F7931A]';
    return 'bg-[#F23645]';
  };

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#1E2336] cursor-help transition-colors"
      title={`Market Feeds: Binance WS + Finnhub API | Latency: ${latency}ms | Status: ${isConnected ? 'Connected' : 'Reconnecting'}`}
    >
      <div className={clsx("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,192,135,0.4)]", getStatusColor())} />
      <span className="text-xs font-mono text-[#8F9CAE]">{latency}ms</span>
    </div>
  );
};
