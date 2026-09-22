import React, { useState } from 'react';
import { HeaderBar } from '../header/HeaderBar';
import { ChartContainer } from '../chart/ChartContainer';
import { LeftDrawingToolbar } from '../chart/LeftDrawingToolbar';
import { SecondaryRightSidebar } from '../sidebar/SecondaryRightSidebar';
import { RightActionSidebar } from '../sidebar/RightActionSidebar';
import { BottomPanel } from '../bottom-panel/BottomPanel';
import { IndicatorsLibrary } from '../indicators/IndicatorsLibrary';
import { BrokerAccountsModal } from '../broker/BrokerAccountsModal';
import { UpdateNotificationToast } from '../../../components/common/UpdateNotificationToast';

export const TradingLayout: React.FC = () => {
  const [showIndicators, setShowIndicators] = useState(false);

  return (
    <div className="w-full h-full overflow-hidden bg-[#0B0E14] flex flex-col select-none">
      {/* Header Bar */}
      <HeaderBar onOpenIndicators={() => setShowIndicators(true)} />

      {/* Main Workspace - Center Area (LTR ensures drawing toolbar sits at the far left edge) */}
      <div className="flex-1 flex min-h-0 min-w-0 pt-14" dir="ltr">
        {/* Left Drawing Toolbar */}
        <LeftDrawingToolbar />

        {/* Chart Area — Full Width */}
        <div className="flex-1 min-w-0 h-full relative bg-[#0B0E14]">
          <ChartContainer />
        </div>

        {/* Secondary Right Sidebar (USE, Settings, Indicators, CSM) */}
        <SecondaryRightSidebar onOpenIndicators={() => setShowIndicators(true)} />

        {/* Right Action Sidebar */}
        <RightActionSidebar />
      </div>

      {/* Bottom Panel */}
      <BottomPanel />

      {/* Broker Accounts Management Modal */}
      <BrokerAccountsModal />

      {/* Indicators Library Modal */}
      {showIndicators && (
        <IndicatorsLibrary isOpen={showIndicators} onClose={() => setShowIndicators(false)} />
      )}

      {/* Zero-Reinstall PWA Update Notification Toast & Forced Modal */}
      <UpdateNotificationToast />
    </div>
  );
};

export default TradingLayout;

