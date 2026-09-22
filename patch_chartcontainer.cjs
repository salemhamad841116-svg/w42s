const fs = require('fs');
let code = fs.readFileSync('src/trading/components/chart/ChartContainer.tsx', 'utf8');

code = code.replace(
  "import { ChartWidget } from './ChartWidget';",
  "import { ChartWidget } from './ChartWidget';\nimport { CurrencyStrengthPanel } from './CurrencyStrengthPanel';"
);

code = code.replace(
  "<ChartWidget />",
  "<ChartWidget />\n        <CurrencyStrengthPanel />"
);

fs.writeFileSync('src/trading/components/chart/ChartContainer.tsx', code);
