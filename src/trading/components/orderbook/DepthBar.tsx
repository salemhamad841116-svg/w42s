import React from 'react';

interface DepthBarProps {
  percentage: number;
  side: 'bid' | 'ask';
}

const DepthBar = React.memo(({ percentage, side }: DepthBarProps) => {
  const bgColor = side === 'bid' ? 'rgba(0,192,135,0.15)' : 'rgba(242,54,69,0.15)';
  
  return (
    <div 
      className="absolute right-0 top-0 h-full transition-all duration-150 pointer-events-none"
      style={{
        width: `${percentage}%`,
        backgroundColor: bgColor
      }}
    />
  );
});

export default DepthBar;