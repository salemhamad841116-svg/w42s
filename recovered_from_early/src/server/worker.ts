// Dedicated BullMQ Notification Worker Entrypoint (notifications.domain.com)
import { globalRedisQueueManager } from '../engine/RedisQueueManager';

console.log('============================================================');
console.log('   BULLMQ NOTIFICATION & QUEUE WORKER SERVICE (Redis FIFO)   ');
console.log('   Mode: NOTIFICATION_WORKER (notifications.domain.com)     ');
console.log('============================================================');

globalRedisQueueManager.subscribe(() => {
  const jobs = globalRedisQueueManager.getBullJobs();
  const activeJobs = jobs.filter((j) => j.status === 'active');
  if (activeJobs.length > 0) {
    console.log(`[BULLMQ WORKER] Processing ${activeJobs.length} active signal push notification(s)...`);
  }
});
