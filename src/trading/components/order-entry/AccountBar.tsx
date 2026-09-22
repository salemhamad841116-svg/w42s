import React from 'react';
import { Wallet } from 'lucide-react';
import clsx from 'clsx';
import { useBrokerStore } from '../../stores/brokerStore';

const AccountBar = React.memo(() => {
  const activeBroker = useBrokerStore((s) => s.activeBroker);
  const mt5Account = useBrokerStore((s) => s.mt5Account);
  const binanceAccount = useBrokerStore((s) => s.binanceAccount);

  // Derive display values from live broker data
  const isMT5 = activeBroker === 'MT5_LIVE' || activeBroker === 'MT5_DEMO';
  const balance = isMT5 ? mt5Account.freeMargin : binanceAccount.availableUSDT;
  const currency = isMT5 ? (mt5Account.currency || 'USD') : 'USDT';
  const status = isMT5 ? mt5Account.status : binanceAccount.status;

  const formattedBalance = balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-col bg-[#151924] p-3 text-sm select-none border-b border-[#262B3D]">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#8F9CAE]">
          <Wallet size={14} />
          <span
            className={clsx(
              status === 'CONNECTED' && 'text-[#8F9CAE]',
              status === 'CONNECTING' && 'animate-pulse text-yellow-400',
              status === 'ERROR' && 'text-red-400',
              status === 'DISCONNECTED' && 'text-zinc-500'
            )}
          >
            {status === 'CONNECTING'
              ? 'Loading...'
              : `${formattedBalance} ${currency}`}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#2962FF]">
          <span className="text-[10px] text-zinc-500">
            {isMT5 ? 'MT5' : 'Binance'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default AccountBar;