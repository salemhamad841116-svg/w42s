require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase Admin SDK
// Keys should be passed via environment variables (e.g., FIREBASE_SERVICE_ACCOUNT base64 string or file path)
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
} catch (error) {
  console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT, using default credentials if available.");
}

admin.initializeApp({
  credential: serviceAccount ? admin.credential.cert(serviceAccount) : admin.credential.applicationDefault()
});
const db = admin.firestore();

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Rate Limiting (5 requests per minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Rate limit exceeded. Try again in a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

const QUOTA_LIMIT = 10;

// Helper to check and update quota
async function checkAndUpdateQuota(uid) {
  const userRef = db.collection('users').doc(uid);
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(userRef);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let count = 0;
    
    if (!doc.exists) {
      count = 1;
      transaction.set(userRef, {
        daily_message_count: count,
        last_reset_date: todayStr
      });
      return true;
    } else {
      const data = doc.data();
      if (data.last_reset_date !== todayStr) {
        count = 1;
        transaction.update(userRef, {
          daily_message_count: count,
          last_reset_date: todayStr
        });
        return true;
      } else {
        count = data.daily_message_count;
        if (count >= QUOTA_LIMIT) {
          return false; // Quota exceeded
        }
        transaction.update(userRef, {
          daily_message_count: count + 1
        });
        return true;
      }
    }
  });
}

// GET /api/status - Returns remaining quota
app.get('/api/status', authMiddleware, async (req, res) => {
  const uid = req.user.uid;
  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let remaining = QUOTA_LIMIT;
    if (doc.exists) {
      const data = doc.data();
      if (data.last_reset_date === todayStr) {
        remaining = Math.max(0, QUOTA_LIMIT - data.daily_message_count);
      }
    }
    res.json({ remaining_messages: remaining });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat - Main chat endpoint
app.post('/api/chat', authMiddleware, limiter, async (req, res) => {
  const uid = req.user.uid;
  const { message, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // 1. Check and deduct quota BEFORE calling API
    const canProceed = await checkAndUpdateQuota(uid);
    if (!canProceed) {
      return res.status(403).json({ error: 'انتهت الحصة اليومية' });
    }

    // 2. Call Gemini API
    const systemInstruction = `أنت مساعد ذكي عام ومفيد. مهمتك تقديم إجابات دقيقة ومباشرة. أجب باختصار شديد (لا تتجاوز 100 كلمة). استخدم القوائم النقطية لتنظيم المعلومات. ارفض بأدب أي طلبات لإنشاء محتوى مسيء أو غير قانوني.`;
    
    // Construct conversation history
    const contents = [];
    if (context && Array.isArray(context)) {
      context.forEach(ctxMsg => {
         contents.push(ctxMsg);
      });
    }
    contents.push(message);

    // Using Gemini 1.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: 250,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error during chat processing' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
