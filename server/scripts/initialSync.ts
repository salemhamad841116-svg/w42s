/**
 * Initial Sync Script
 * 
 * Run this once to populate the SQLite database with historical OHLCV data.
 * Can be stopped and resumed — it picks up where it left off.
 * 
 * Usage:
 *   npx tsx server/scripts/initialSync.ts
 *   npx tsx server/scripts/initialSync.ts --years=1
 */
import { runInitialSync, DEFAULT_SYMBOLS } from '../syncScheduler.js';

// Parse CLI args
const args = process.argv.slice(2);
let yearsBack = 5;

for (const arg of args) {
  if (arg.startsWith('--years=')) {
    yearsBack = parseInt(arg.split('=')[1]) || 5;
  }
}

console.log('');
console.log('═══════════════════════════════════════════');
console.log('  📥 Historical Data Initial Sync');
console.log(`  📅 Range: last ${yearsBack} year(s)`);
console.log(`  💱 Symbols: ${DEFAULT_SYMBOLS.join(', ')}`);
console.log(`  📊 Timeframes: 1d, 4h, 1h, 15m, 5m, 1m`);
console.log('═══════════════════════════════════════════');
console.log('');
console.log('⏳ This may take 30-60 minutes for a full sync.');
console.log('   You can stop (Ctrl+C) and resume later — it picks up where it left off.');
console.log('');

const startTime = Date.now();

runInitialSync(DEFAULT_SYMBOLS, yearsBack)
  .then(() => {
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log('');
    console.log(`✅ Initial sync completed in ${elapsed} minutes.`);
    console.log('   You can now start the server with: npm run dev');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Initial sync failed:', err);
    process.exit(1);
  });
