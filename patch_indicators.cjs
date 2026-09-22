const fs = require('fs');
let code = fs.readFileSync('src/trading/components/header/IndicatorMenu.tsx', 'utf8');

code = code.replace(
  "import { useChartStore } from '../../store';",
  "import { useChartStore } from '../../store';\nimport { useCurrencyStrengthStore } from '../../stores/currencyStrengthStore';"
);

code = code.replace(
  "const INDICATORS = ['MA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'Volume'];",
  "const INDICATORS = ['MA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'Volume', 'Currency Strength'];"
);

code = code.replace(
  "const toggleIndicator = useChartStore((state) => state.toggleIndicator);",
  "const toggleIndicator = useChartStore((state) => state.toggleIndicator);\n  const { isVisible: isStrengthVisible, toggleVisibility: toggleStrength } = useCurrencyStrengthStore();"
);

code = code.replace(
  "const isActive = indicators.includes(ind);",
  "const isActive = ind === 'Currency Strength' ? isStrengthVisible : indicators.includes(ind);"
);

code = code.replace(
  "onClick={() => toggleIndicator(ind)}",
  "onClick={() => ind === 'Currency Strength' ? toggleStrength() : toggleIndicator(ind)}"
);

fs.writeFileSync('src/trading/components/header/IndicatorMenu.tsx', code);
