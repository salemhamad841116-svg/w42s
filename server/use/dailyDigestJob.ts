/**
 * Universal Strategy Engine — Automated Daily Digest
 * 
 * Generates and sends a summary report of paper trading performance
 * at the end of each trading day.
 */

import { getDb } from '../database.js';
import { sendEmail } from './emailService.js';
import { getValidationDashboard } from './validationService.js';

let isJobRunning = false;
let lastSentDate = '';

/**
 * Gathers today's stats, checks for warnings, and sends the email.
 */
async function generateAndSendDigest() {
  const db = getDb();
  
  // Define "today" for the query
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000;
  const endOfDay = startOfDay + 86400;

  try {
    // 1. Get today's trades from use_paper_trades
    const todayTrades = db.prepare(`
      SELECT COUNT(*) as count, SUM(realized_r) as total_r
      FROM use_paper_trades
      WHERE exit_time >= ? AND exit_time < ?
    `).get(startOfDay, endOfDay) as { count: number; total_r: number | null };

    const tradesCount = todayTrades.count || 0;
    const totalR = (todayTrades.total_r || 0).toFixed(2);

    // 2. Get drift warnings from the validation dashboard
    const validationData = getValidationDashboard();
    const driftWarnings = validationData.driftAlerts || [];
    const hasWarnings = driftWarnings.length > 0;

    // 3. Compose HTML Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background-color: #1A1F2E; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0;">USE Daily Digest</h1>
          <p style="color: #8F9CAE; margin: 5px 0 0 0;">Paper Trading Performance Report</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
          <h3>Today's Performance</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Paper Trades Closed:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${tradesCount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Total Realized R:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: ${Number(totalR) >= 0 ? 'green' : 'red'};">
                ${Number(totalR) > 0 ? '+' : ''}${totalR} R
              </td>
            </tr>
          </table>

          <h3>Model Status & Warnings</h3>
          ${hasWarnings 
            ? `<div style="background-color: #fff3f3; border-left: 4px solid #ff4d4f; padding: 10px 15px; margin-bottom: 20px;">
                 <ul style="margin: 0; padding-left: 20px; color: #d9363e;">
                   ${driftWarnings.map(w => `<li><strong>${w.type}</strong>: ${w.message}</li>`).join('')}
                 </ul>
               </div>`
            : `<div style="background-color: #f6ffed; border-left: 4px solid #52c41a; padding: 10px 15px; margin-bottom: 20px;">
                 <p style="margin: 0; color: #389e0d;">✅ All models are calibrated. No drift detected.</p>
               </div>`
          }
          
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
            This is an automated message from your Universal Strategy Engine.
          </p>
        </div>
      </div>
    `;

    // 4. Send Email
    const targetEmail = 'salemhamad841116@gmail.com';
    const dateStr = now.toISOString().split('T')[0];
    const subject = `USE Daily Digest [${dateStr}] - ${Number(totalR) >= 0 ? '✅ Positive' : '⚠️ Negative'} R`;

    await sendEmail(targetEmail, subject, emailHtml);

  } catch (error) {
    console.error('❌ Error generating daily digest:', error);
  }
}

/**
 * Starts a background interval to check if it's time to send the daily digest.
 * Configured to send roughly at 23:55 local server time.
 */
export function startDailyDigestJob() {
  if (isJobRunning) return;
  isJobRunning = true;
  
  console.log('🕒 Daily Digest Job scheduled (Checks every minute).');

  setInterval(async () => {
    const now = new Date();
    // Use local time for sending at 23:55 (11:55 PM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const todayStr = now.toISOString().split('T')[0];

    if (hours === 23 && minutes >= 55) {
      if (lastSentDate !== todayStr) {
        lastSentDate = todayStr;
        console.log(`⏳ Triggering Daily Digest for ${todayStr}...`);
        await generateAndSendDigest();
      }
    }
  }, 60 * 1000); // Check every minute
}
