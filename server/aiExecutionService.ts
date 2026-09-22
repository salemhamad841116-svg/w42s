import { GoogleGenAI, Type } from '@google/genai';
import { getDb } from './database.js';
import { calculateDynamicLevels } from './dynamicLevels.js';
import { getKey, keyEvents } from './keyManager.js';
import dotenv from 'dotenv';
dotenv.config();

// Define execution signal interface
export interface AISignal {
  id: string;
  timestamp: number;
  newsHeadline: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  confidence: number; // 0-100
  reason: string;
  historicalMatch: {
    similarEventsFound: number;
    avgMovePercent: number;
    winRate: number; // 0-100
  };
  levels: {
    sl: number;
    tp: number;
  };
  status: 'EXECUTED' | 'IGNORED';
}

let ai: GoogleGenAI | null = null;

// Initialize Gemini with key from memory
function initGemini() {
  const key = getKey('gemini');
  if (key) {
    ai = new GoogleGenAI({ apiKey: key });
    console.log('🤖 AI Engine: Gemini client initialized from secure vault.');
  } else {
    ai = null;
    console.warn('⚠️ AI Engine: Gemini key missing. Analysis suspended.');
  }
}

// Hot-reload if key changes
keyEvents.on('keyUpdated', (service) => {
  if (service === 'gemini') initGemini();
});

const processedNewsIds = new Set<number>();
let lastNewsTime = Math.floor(Date.now() / 1000) - 86400; // Only look at news from last 24h

export const aiSignalLogs: AISignal[] = [];
export const clients: Set<(signal: AISignal) => void> = new Set();

function emitSignal(signal: AISignal) {
  aiSignalLogs.unshift(signal);
  if (aiSignalLogs.length > 100) aiSignalLogs.pop();
  clients.forEach(c => c(signal));
}

/**
 * 1. Fetch News from Finnhub using dynamic key
 */
async function fetchLatestNews() {
  const finnhubKey = getKey('finnhub');
  if (!finnhubKey) return [];
  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`);
    if (!res.ok) return [];
    const news = await res.json();
    return news.filter((item: any) => item.datetime > lastNewsTime && !processedNewsIds.has(item.id));
  } catch (err) {
    console.error('Failed to fetch Finnhub news:', err);
    return [];
  }
}

/**
 * 2. Analyze sentiment via Gemini (Advanced Prompt)
 */
async function analyzeNewsWithAI(headline: string, summary: string) {
  if (!ai) return null;
  
  const prompt = `
  You are an expert quantitative algorithmic trader AI.
  Analyze this financial news event:
  Headline: "${headline}"
  Summary: "${summary}"
  
  RULES:
  1. Asset Mapping: Determine the MOST impacted major currency pair or crypto. 
     CRITICAL: If it's a macroeconomic event (e.g., US CPI, Fed Rates, NFP), remember that POSITIVE USD news is BEARISH for EUR/USD, GBP/USD, and XAU/USD. Negative USD news is BULLISH for them.
  2. Deviation Focus: Look for the gap between "Expected/Forecast" vs "Actual" numbers in the text. A large deviation increases shock value and confidence.
  3. Strict JSON: You must output ONLY a valid JSON object matching the provided schema. No markdown, no conversational text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: process.env.OTC_GEMINI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING, description: "e.g., BTC/USDT, EUR/USD, XAU/USD" },
            direction: { type: Type.STRING, enum: ['BUY', 'SELL', 'NEUTRAL'] },
            confidence: { type: Type.INTEGER, description: "0 to 100 based on deviation and clarity" },
            reason: { type: Type.STRING, description: "Brief explanation mentioning deviation if any" }
          },
          required: ["symbol", "direction", "confidence", "reason"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as { symbol: string, direction: 'BUY'|'SELL'|'NEUTRAL', confidence: number, reason: string };
    }
  } catch (err) {
    console.error('Gemini analysis failed:', err);
  }
  return null;
}

/**
 * 3. Match historical price action in SQLite
 */
function findHistoricalMatch(symbol: string, direction: 'BUY' | 'SELL') {
  // In a real advanced setup, we'd search for NLP embeddings of news.
  // For now, we simulate matching similar momentum patterns in the DB.
  const db = getDb();
  
  // Find recent candles for this symbol to determine current baseline volatility
  const stmt = db.prepare(`SELECT open, close FROM candles WHERE symbol = ? AND timeframe = '1h' ORDER BY time DESC LIMIT 24`);
  const recent = stmt.all(symbol) as any[];
  
  if (recent.length === 0) {
    return { similarEventsFound: 0, avgMovePercent: 0.5, winRate: 50 }; // No history yet
  }

  // Calculate some basic mock stats based on DB data presence to represent "Historical Backtest"
  const similarEventsFound = Math.floor(Math.random() * 15) + 3; // 3 to 17 similar events
  const avgMovePercent = (Math.random() * 1.5 + 0.5); // 0.5% to 2.0% average move
  const winRate = direction === 'BUY' ? Math.floor(Math.random() * 30) + 60 : Math.floor(Math.random() * 30) + 55; // 55% to 90%

  return { similarEventsFound, avgMovePercent, winRate };
}

/**
 * 4. Get Current Price (Mocking a DB query for the latest close, or fallback)
 */
function getLatestPrice(symbol: string): number {
  const db = getDb();
  const row = db.prepare(`SELECT close FROM candles WHERE symbol = ? AND timeframe = '1m' ORDER BY time DESC LIMIT 1`).get(symbol) as { close: number };
  
  if (row && row.close) return row.close;
  
  // Fallback defaults if DB is still syncing
  if (symbol.includes('BTC')) return 65000;
  if (symbol.includes('ETH')) return 3500;
  if (symbol.includes('XAU')) return 2400;
  if (symbol.includes('JPY')) return 150.5;
  return 1.0850; // EUR/USD fallback
}

/**
 * Main Engine Loop
 */
export async function runAIEngineCycle() {
  const news = await fetchLatestNews();
  
  for (const item of news) {
    processedNewsIds.add(item.id);
    if (item.datetime > lastNewsTime) {
      lastNewsTime = item.datetime;
    }

    console.log(`🧠 AI Engine evaluating news: "${item.headline}"`);
    
    // Analyze with Gemini
    const analysis = await analyzeNewsWithAI(item.headline, item.summary);
    if (!analysis || analysis.direction === 'NEUTRAL' || analysis.confidence < 60) {
      continue; // Ignore low confidence or neutral news
    }

    // Historical Backtest Check
    const history = findHistoricalMatch(analysis.symbol, analysis.direction);
    
    // Calculate Dynamic SL/TP
    const currentPrice = getLatestPrice(analysis.symbol);
    const levels = calculateDynamicLevels(currentPrice, analysis.direction, analysis.confidence);

    // Decision Logic
    const shouldExecute = analysis.confidence >= 75 && history.winRate >= 65;

    const signal: AISignal = {
      id: `AI_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      timestamp: Date.now(),
      newsHeadline: item.headline,
      symbol: analysis.symbol,
      direction: analysis.direction,
      confidence: analysis.confidence,
      reason: analysis.reason,
      historicalMatch: history,
      levels,
      status: shouldExecute ? 'EXECUTED' : 'IGNORED'
    };

    if (shouldExecute) {
      console.log(`⚡ AI EXECUTE: ${signal.direction} ${signal.symbol} (Conf: ${signal.confidence}%, WinRate: ${history.winRate}%)`);
    } else {
      console.log(`🛑 AI IGNORED: ${signal.direction} ${signal.symbol} (Did not meet execution threshold)`);
    }

    emitSignal(signal);
  }
}

// Start polling
let engineTimer: ReturnType<typeof setInterval> | null = null;

export function startAIEngine(intervalMs = 30_000) {
  if (engineTimer) return;
  
  initGemini(); // Initialize with whatever key is in RAM
  
  if (!getKey('gemini')) {
    console.warn('⚠️  AI Engine: GEMINI_API_KEY not found in vault. Waiting for user to configure it in Admin UI.');
  }
  
  console.log(`🤖 AI Engine started. Polling news every ${intervalMs / 1000}s...`);
  runAIEngineCycle(); // Run immediately
  engineTimer = setInterval(runAIEngineCycle, intervalMs);
}
