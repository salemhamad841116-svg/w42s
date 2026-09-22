import React, { useEffect, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useOrderbookStore } from '../../stores/orderbookStore';
import OrderBookHeader from './OrderBookHeader';
import OrderBookRow from './OrderBookRow';
import MidPriceBar from './MidPriceBar';

const OrderBook = React.memo(() => {
  const bids = useOrderbookStore((state) => state.bids);
  const asks = useOrderbookStore((state) => state.asks);
  const viewMode = useOrderbookStore((state) => state.viewMode);
  const parentRef = useRef<HTMLDivElement>(null);

  const maxTotal = useMemo(() => {
    const maxBid = bids.length ? bids[bids.length - 1].total : 0;
    const maxAsk = asks.length ? asks[0]?.total : 0;
    return Math.max(maxBid, maxAsk) || 1;
  }, [bids, asks]);

  const visibleAsks = viewMode === 'bids' ? [] : asks;
  const visibleBids = viewMode === 'asks' ? [] : bids;

  const totalItems = visibleAsks.length + (viewMode === 'both' ? 1 : 0) + visibleBids.length;

  const rowVirtualizer = useVirtualizer({
    count: totalItems,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      if (viewMode === 'both' && index === visibleAsks.length) return 32;
      return 24;
    },
    overscan: 10
  });

  return (
    <div className="flex flex-col w-full h-full bg-[#0B0E14] text-white select-none">
      <OrderBookHeader />
      <div 
        ref={parentRef} 
        className="flex-1 overflow-auto overflow-x-hidden relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const index = virtualItem.index;
            let content;
            
            if (index < visibleAsks.length) {
              const ask = visibleAsks[index];
              content = (
                <OrderBookRow
                  key={`ask-${ask.price}`}
                  price={ask.price}
                  amount={ask.amount}
                  total={ask.total}
                  maxTotal={maxTotal}
                  side="ask"
                />
              );
            } else if (viewMode === 'both' && index === visibleAsks.length) {
              content = <MidPriceBar key="mid-price" />;
            } else {
              const bidIndex = index - visibleAsks.length - (viewMode === 'both' ? 1 : 0);
              const bid = visibleBids[bidIndex];
              content = (
                <OrderBookRow
                  key={`bid-${bid.price}`}
                  price={bid.price}
                  amount={bid.amount}
                  total={bid.total}
                  maxTotal={maxTotal}
                  side="bid"
                />
              );
            }

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default OrderBook;
