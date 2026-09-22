const fs = require('fs');
let code = fs.readFileSync('src/trading/components/header/HeaderBar.tsx', 'utf8');

code = code.replace(
  "import { TimeframeSelector } from './TimeframeSelector';",
  "import { TimeframeSelector } from './TimeframeSelector';\nimport { DesktopMarketBar } from './DesktopMarketBar';"
);

// We want to hide AssetSelector, MarketTicker, and TimeframeSelector on md+
// because they are now inside DesktopMarketBar
code = code.replace(
  '<AssetSelector />',
  '<div className="md:hidden h-full flex items-center"><AssetSelector /></div>'
);

code = code.replace(
  '<MarketTicker />',
  '<div className="md:hidden h-full flex items-center"><MarketTicker /></div>\n        <DesktopMarketBar />'
);

code = code.replace(
  '<TimeframeSelector />',
  '<div className="md:hidden h-full flex items-center"><TimeframeSelector /></div>'
);

fs.writeFileSync('src/trading/components/header/HeaderBar.tsx', code);
