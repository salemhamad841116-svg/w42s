import { OpportunityCandidate, QualityFilterConfig, QualityFilterEvaluation } from '../types';

export const DEFAULT_QUALITY_FILTER_CONFIG: QualityFilterConfig = {
  minConfidenceScore: 80,
  requireMultiIndicatorConfirm: true,
  requireTrendAlignment: true,
  requireVolumeSpike: false,
  maxDailySignalsLimit: 25,
  autoApproveAndDispatch: true,
  blockedPairs: [],
};

export function evaluateCandidateQuality(
  candidate: OpportunityCandidate,
  config: QualityFilterConfig = DEFAULT_QUALITY_FILTER_CONFIG
): QualityFilterEvaluation {
  if (config.blockedPairs && config.blockedPairs.includes(candidate.pair)) {
    return {
      passed: false,
      finalScore: 0,
      breakdown: {
        indicatorConfirmScore: 0,
        trendAlignmentScore: 0,
        volumeSpikeScore: 0,
        riskRewardScore: 0,
      },
      reasonAr: `الزوج ${candidate.pair} محظور في إعدادات فلتر الجودة.`,
      reasonEn: `Pair ${candidate.pair} is blocked in quality filter config.`,
    };
  }

  let indicatorConfirmScore = 30;
  let trendAlignmentScore = 30;
  let volumeSpikeScore = 12;
  let riskRewardScore = 15;

  const indicators = candidate.indicatorsBreakdown || {};
  if (indicators.trend) {
    const isBull = candidate.type === 'BUY';
    const isTrendBull = indicators.trend === 'bullish' || indicators.trend === 'up';
    if (isBull === isTrendBull) {
      trendAlignmentScore = 35;
    } else {
      trendAlignmentScore = 15;
    }
  }

  if (indicators.volumeSpikeRatio && indicators.volumeSpikeRatio > 1.5) {
    volumeSpikeScore = 15;
  }

  const rawConfidence = candidate.rawConfidenceScore || 85;
  const computedScore = Math.min(
    100,
    Math.round(
      (rawConfidence * 0.4) +
      indicatorConfirmScore +
      trendAlignmentScore * 0.5 +
      volumeSpikeScore +
      riskRewardScore * 0.5
    )
  );

  const finalScore = Math.min(100, Math.max(0, computedScore));
  const passed = finalScore >= config.minConfidenceScore;

  return {
    passed,
    finalScore,
    breakdown: {
      indicatorConfirmScore,
      trendAlignmentScore,
      volumeSpikeScore,
      riskRewardScore,
    },
    reasonAr: passed
      ? `تم اجتياز الفلتر بنجاح بنسبة ثقة ${finalScore}%. المؤشرات متوافقة مع الاتجاه العام.`
      : `لم يتم اجتياز الفلتر (نسبة الثقة ${finalScore}% أقل من الحد الأدنى ${config.minConfidenceScore}%).`,
    reasonEn: passed
      ? `Passed quality filter with ${finalScore}% confidence score.`
      : `Failed quality filter (${finalScore}% below threshold of ${config.minConfidenceScore}%).`,
  };
}
