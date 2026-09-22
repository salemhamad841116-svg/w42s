const fs = require('fs');
let code = fs.readFileSync('src/trading/components/header/TimeframeSelector.tsx', 'utf8');

code = code.replace(
  /className={clsx\('transition-transform duration-200 text-\[#8F9CAE\]', dropdownOpen && 'rotate-180 text-white'\)}/g,
  `className={clsx('transition-transform duration-200', dropdownOpen ? (isLight ? 'text-black' : 'text-white') : (isLight ? 'text-gray-500' : 'text-[#8F9CAE]'), dropdownOpen && 'rotate-180')}`
);

fs.writeFileSync('src/trading/components/header/TimeframeSelector.tsx', code);
