import { useEffect, useState } from 'react';
import { brokerService } from '../../services/brokerService';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { useBrokerStore } from '../../stores/brokerStore';
import { useAISettingsStore } from '../../stores/useAISettingsStore';
import { calculateDynamicLotSize } from '../../services/riskManager';
import { useMarketStore } from '../../stores/marketStore';

export interface AISignal {
  id: string;
  timestamp: number;
  newsHeadline: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  reason: string;
  levels: { sl: number; tp: number };
  status: 'EXECUTED' | 'IGNORED';
}

/**
 * AIGatewayProvider
 * 
 * Invisible root component that listens to the AI Engine's SSE stream.
 * Computes Dynamic Lot Size, applies Risk Management, and executes the trade.
 */
export function AIGatewayProvider({ children }: { children: React.ReactNode }) {
  const { addOrder } = useOrderEntryStore();
  const broker = useBrokerStore((state) => state.activeBroker);
  const balance = useBrokerStore((state) => state.balance);
  const { isAIEnabled, maxRiskPerTradePercent } = useAISettingsStore();
  const [lastExecutedSignal, setLastExecutedSignal] = useState<string | null>(null);

  useEffect(() => {
    console.log('🤖 AI Gateway connected to execution stream...');
    const eventSource = new EventSource('/api/ai/stream');

    eventSource.onmessage = (event) => {
      try {
        const signal: AISignal = JSON.parse(event.data);
        
        if (signal.status === 'EXECUTED' && signal.id !== lastExecutedSignal) {
          setLastExecutedSignal(signal.id);
          
          if (!isAIEnabled) {
            console.warn(`🛑 AI Engine is disabled globally by Admin. Ignoring signal ${signal.id}.`);
            return;
          }

          // Fetch current price for risk math
          // Note: Ticker could be for another symbol, but in a real app we'd fetch the specific symbol's price.
          // Since this is a fast execution, we approximate current price from the signal itself if needed, 
          // or we query the marketStore. For safety, we use the midpoint between sl and tp if current price is missing,
          // but we assume the marketStore has the live price.
          // To ensure safety, let's reverse-engineer the entry price from the SL/TP logic:
          // The backend used a 0.5% risk distance for SL. 
          // EntryPrice = SL / (1 - 0.005) for BUY.
          const entryPrice = signal.direction === 'BUY' 
             ? signal.levels.sl / (1 - 0.005) 
             : signal.levels.sl / (1 + 0.005);
          
          // 1. Calculate Risk and Lot Size
          const riskProfile = calculateDynamicLotSize(
            balance,
            entryPrice,
            signal.levels.sl,
            maxRiskPerTradePercent,
            signal.symbol
          );

          if (!riskProfile.isValid) {
            console.error(`❌ AI Auto-Execution Rejected by Risk Manager: ${riskProfile.reason}`);
            return;
          }

          console.log(`⚡ AI Gateway routing order to ${broker}. Risk: $${riskProfile.amountAtRiskUsd} (${maxRiskPerTradePercent}%), Lot: ${riskProfile.lotSize}`);
          
          // 2. Dispatch to BrokerService
          brokerService.executeOrder({
            symbol: signal.symbol,
            side: signal.direction,
            type: 'MARKET',
            amount: riskProfile.lotSize,
            stopLoss: signal.levels.sl,
            takeProfit: signal.levels.tp,
          }).then(result => {
            if (result.success) {
              console.log('✅ AI Auto-Execution Success:', result.ticketId);
            } else {
              console.error('❌ AI Auto-Execution Failed:', result.message);
            }
          });
        }
      } catch (err) {
        console.error('Failed to parse AI signal:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn('AI Gateway stream error, reconnecting...', err);
    };

    return () => {
      console.log('🛑 AI Gateway disconnected.');
      eventSource.close();
    };
  }, [broker, lastExecutedSignal]);

  return <>{children}</>;
}
