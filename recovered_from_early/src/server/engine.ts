// Dedicated Autonomous Trading Engine Entrypoint (engine.domain.com)
import { globalAutoEngine } from '../engine/AutoSignalEngine';
import { globalRedisQueueManager } from '../engine/RedisQueueManager';

console.log('============================================================');
console.log('   AUTONOMOUS FOREX TRADING ENGINE SERVICE (24/7 scanning)   ');
console.log('   Mode: STANDALONE_ENGINE (engine.domain.com)              ');
console.log('============================================================');

globalAutoEngine.onStatusChanged((engineStatus) => {
  if (engineStatus.totalGeneratedToday > 0) {
    console.log(`[TRADING ENGINE] Total Generated Signals Today: ${engineStatus.totalGeneratedToday}`);
  }
});

// Auto Engine Scan Loop Hook
setInterval(() => {
  console.log(`[TRADING ENGINE SCAN] Market Feed Active. Redis Queue depth: ${globalRedisQueueManager.getBullJobs().length} jobs.`);
}, 10000);

