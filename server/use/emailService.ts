/**
 * Universal Strategy Engine — Email Service
 * 
 * Handles sending automated reports and alerts.
 * If SMTP credentials are not found in environment variables,
 * it safely logs the email content to the console.
 */

import nodemailer from 'nodemailer';

// Configuration can be expanded to use the KeyManager if preferred in the future
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);

  if (!isConfigured) {
    console.log('\n======================================================');
    console.log(`📧 [MOCK EMAIL] To: ${to}`);
    console.log(`📋 Subject: ${subject}`);
    console.log('--- Content ---');
    // Simple HTML strip for console
    console.log(htmlContent.replace(/<[^>]*>?/gm, '')); 
    console.log('======================================================\n');
    console.log('💡 Tip: Configure SMTP_USER and SMTP_PASS in .env to send real emails.');
    return true; // Simulate success
  }

  try {
    const info = await transporter.sendMail({
      from: `"USE Engine" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}
