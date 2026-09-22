const fs = require('fs');
let code = fs.readFileSync('src/trading/components/header/AssetSelector.tsx', 'utf8');

code = code.replace(
  'export const AssetSelector: React.FC = () => {',
  'export const AssetSelector: React.FC<{isLight?: boolean}> = ({ isLight }) => {'
);

code = code.replace(
  /className="flex items-center gap-2 text-inherit hover:bg-black\/5 dark:text-white dark:hover:bg-\[#1E2336\] px-3 py-1\.5 rounded font-medium text-lg transition-colors"/g,
  `className={clsx("flex items-center gap-2 px-3 py-1.5 rounded font-medium text-lg transition-colors", isLight ? "text-black hover:bg-black/5" : "text-white hover:bg-[#1E2336]")}`
);

code = code.replace(
  /<ChevronDown size=\{16\} className=\{clsx\("text-\[#8F9CAE\] transition-transform", isOpen && "rotate-180"\)\} \/>/g,
  `<ChevronDown size={16} className={clsx("transition-transform", isLight ? "text-gray-500" : "text-[#8F9CAE]", isOpen && "rotate-180")} />`
);

fs.writeFileSync('src/trading/components/header/AssetSelector.tsx', code);
