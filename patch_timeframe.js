const fs = require('fs');
let code = fs.readFileSync('src/trading/components/header/TimeframeSelector.tsx', 'utf8');

code = code.replace('export const TimeframeSelector: React.FC = () => {', 'export const TimeframeSelector: React.FC<{isLight?: boolean}> = ({ isLight }) => {');

code = code.replace(
  /dropdownOpen\n\s*\?\s*'bg-\[#1E222D\] text-white border-\[#2A2E39\]'\n\s*:\s*'bg-transparent text-\[#D1D4DC\] hover:text-white hover:bg-\[#1E222D\] border-transparent hover:border-\[#2A2E39\]'/g,
  `dropdownOpen
            ? (isLight ? 'bg-black/10 text-black border-black/20' : 'bg-[#1E222D] text-white border-[#2A2E39]')
            : (isLight ? 'bg-transparent text-black hover:bg-black/5 border-black/10' : 'bg-transparent text-[#D1D4DC] hover:text-white hover:bg-[#1E222D] border-transparent hover:border-[#2A2E39]')`
);

fs.writeFileSync('src/trading/components/header/TimeframeSelector.tsx', code);
