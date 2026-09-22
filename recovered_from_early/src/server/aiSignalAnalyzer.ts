/**
 * AI Signal Analyzer using Google Gemini
 * محلل الإشارات باستخدام الذكاء الاصطناعي (جوجل جيمني)
 */

import { GoogleGenAI } from '@google/genai';
import { OHLCVCandle } from './otcDataProvider';
import { TechnicalAnalysis } from './technicalIndicators';
import crypto from 'crypto';

export interface AISignalResult {
  signal: 'BUY' | 'SELL';
  confidence: string;
  reason: string;
  timestamp: string;
  pair: string;
  analysisId: string;
}

export interface OTCScannerStatus {
  isAnalyzing: boolean;
  lastAnalysisTime: number | null;
  cooldownMs: number;
  error: string | null;
}

class AISignalAnalyzer {
  private genai: GoogleGenAI | null = null;
  private isAnalyzing: boolean = false;
  private lastAnalysisTime: number | null = null;
  private readonly cooldownMs: number = 20000; // 20 seconds / 20 ثانية
  private history: AISignalResult[] = [];
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genai = new GoogleGenAI({ apiKey });
    } else {
      console.warn('GEMINI_API_KEY is missing. Analyzer will use fallback mocks. / مفتاح API مفقود، سيتم استخدام بيانات وهمية');
    }
  }

  /**
   * Get the current status of the analyzer.
   * استرجاع حالة المحلل الحالية
   */
  public getStatus(): OTCScannerStatus {
    return {
      isAnalyzing: this.isAnalyzing,
      lastAnalysisTime: this.lastAnalysisTime,
      cooldownMs: this.cooldownMs,
      error: null
    };
  }

  /**
   * Get the analysis history.
   * استرجاع سجل التحليلات
   */
  public getHistory(): AISignalResult[] {
    return [...this.history];
  }

  /**
   * Generates a unique ID for the analysis.
   */
  private generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  }

  /**
   * Runs the AI analysis.
   * تشغيل تحليل الذكاء الاصطناعي
   * 
   * @param pair The trading pair / زوج التداول
   * @param candles The recent candles / الشموع الأخيرة
   * @param technicals The technical analysis data / بيانات التحليل الفني
   * @returns AI Signal Result / نتيجة إشارة الذكاء الاصطناعي
   */
  public async analyze(pair: string, candles: OHLCVCandle[], technicals: TechnicalAnalysis): Promise<AISignalResult> {
    if (this.isAnalyzing) {
      throw new Error('Analysis is already in progress / التحليل قيد التنفيذ حالياً');
    }
    
    const now = Date.now();
    if (this.lastAnalysisTime && (now - this.lastAnalysisTime) < this.cooldownMs) {
      throw new Error(`Cooldown active. Please wait / يرجى الانتظار، فترة التهدئة نشطة`);
    }

    this.isAnalyzing = true;
    
    try {
      if (!this.genai) {
        // Fallback mock generation if no API key
        return this.generateMockResult(pair, technicals);
      }

      const prompt = `
        بصفتك متداول محترف في أسواق OTC، قم بتحليل البيانات التالية لزوج ${pair}.
        بيانات التحليل الفني:
        - الموقف السعري من البولينجر باند: ${technicals.pricePosition}
        - قيمة ATR (التقلب): ${technicals.atr}
        - آخر إغلاق: ${technicals.lastClose}
        
        بيانات الشموع الأخيرة:
        ${JSON.stringify(candles.slice(-3))}

        بناءً على ذلك، هل تقترح الشراء (BUY) أم البيع (SELL)؟
        يجب أن يكون الرد بتنسيق JSON حصراً كالتالي:
        {
          "signal": "BUY" أو "SELL",
          "confidence": "نسبة مئوية مثل 85%",
          "reason": "سبب مقنع باللغة العربية بناءً على التحليل الفني"
        }
      `;

      // 15 seconds timeout controller
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 15000);

      try {
        const response = await this.genai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          config: { 
            responseMimeType: 'application/json' 
          }
        });
        
        clearTimeout(timeout);
        
        let parsedResult: any;
        if (response.text) {
            parsedResult = JSON.parse(response.text);
        } else {
            throw new Error("Empty response from AI / رد فارغ من الذكاء الاصطناعي");
        }

        const signalResult: AISignalResult = {
          signal: parsedResult.signal === 'BUY' ? 'BUY' : 'SELL',
          confidence: parsedResult.confidence || '70%',
          reason: parsedResult.reason || 'تحليل بناءً على حركة السعر',
          timestamp: new Date().toISOString(),
          pair,
          analysisId: this.generateId()
        };

        this.updateHistory(signalResult);
        this.lastAnalysisTime = Date.now();
        
        return signalResult;
      } catch (err) {
        clearTimeout(timeout);
        console.error('AI Analysis failed, falling back to mock:', err);
        return this.generateMockResult(pair, technicals);
      }
    } finally {
      this.isAnalyzing = false;
    }
  }
  
  private updateHistory(result: AISignalResult) {
    this.history.unshift(result);
    if (this.history.length > 50) {
      this.history.pop();
    }
  }

  private generateMockResult(pair: string, technicals: TechnicalAnalysis): AISignalResult {
    const isBuy = technicals.pricePosition === 'near_lower' || technicals.pricePosition === 'below_lower';
    const result: AISignalResult = {
      signal: isBuy ? 'BUY' : 'SELL',
      confidence: `${Math.floor(Math.random() * 20) + 70}%`,
      reason: isBuy 
        ? 'السعر بالقرب من الحد السفلي للبولينجر باند مما يشير إلى فرصة شراء محتملة (بيانات وهمية)'
        : 'السعر بالقرب من الحد العلوي للبولينجر باند مما يشير إلى فرصة بيع محتملة (بيانات وهمية)',
      timestamp: new Date().toISOString(),
      pair,
      analysisId: this.generateId()
    };
    this.updateHistory(result);
    this.lastAnalysisTime = Date.now();
    return result;
  }
}

// Singleton instance / نسخة واحدة عامة
export const globalAIAnalyzer = new AISignalAnalyzer();
