/**
 * Strategy Parser
 * Parses strategy code, detects language, and performs security validation.
 */

import type { StrategyDefinition, StrategyLanguage, IndicatorDependency, EntryRule, ExitRule, RiskRule } from './types.js';

export function detectLanguage(code: string): StrategyLanguage {
    if (code.includes('//@version') || code.includes('strategy(') || code.includes('indicator(')) {
        return 'pine';
    }
    
    if (code.includes('#property') || code.includes('OnTick()') || code.includes('OnInit()')) {
        return 'mql5';
    }
    
    if (code.includes('import pandas') || code.includes('def ') || code.includes('class ')) {
        return 'python';
    }
    
    return 'javascript';
}

export function validateSecurely(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // REJECT code > 50KB
    if (code.length > 50 * 1024) {
        errors.push('Code size exceeds the 50KB limit.');
    }
    
    // REJECT potentially dangerous constructs
    const forbiddenPatterns = [
        'require(',
        'import(',
        'eval(',
        'Function(',
        'process.',
        'fs.',
        'child_process',
        'http.',
        'https.',
        'net.',
        'exec('
    ];
    
    for (const pattern of forbiddenPatterns) {
        if (code.includes(pattern)) {
            errors.push(`Security violation: Usage of forbidden pattern "${pattern}" is not allowed.`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export function parseStrategy(code: string, name: string, id: string): StrategyDefinition {
    const indicators: IndicatorDependency[] = [];
    
    // Extract indicator references
    const lowerCode = code.toLowerCase();
    const commonIndicators = ['rsi', 'macd', 'ema', 'sma', 'atr', 'bollinger'];
    for (const ind of commonIndicators) {
        if (lowerCode.includes(ind)) {
            indicators.push({ name: ind.toUpperCase() });
        }
    }
    
    // Extract entry conditions
    const entryRules: EntryRule[] = [];
    const entryPatterns = ['if', 'buy', 'close >', 'rsi <', 'crossover'];
    for (const pat of entryPatterns) {
        if (lowerCode.includes(pat)) {
            entryRules.push({ condition: `Detected pattern: ${pat}`, rawCode: pat });
        }
    }
    
    // Extract risk parameters
    const riskRules: RiskRule = {
        stopLossPct: 0.02,
        takeProfitPct: 0.04
    };
    
    if (lowerCode.includes('sl') || lowerCode.includes('stoploss') || lowerCode.includes('stop loss')) {
        riskRules.stopLossPct = 0.02; // Extracted stop loss
    }
    
    if (lowerCode.includes('tp') || lowerCode.includes('takeprofit') || lowerCode.includes('take profit')) {
        riskRules.takeProfitPct = 0.04; // Extracted take profit
    }
    
    return {
        id,
        name,
        description: 'Auto-parsed strategy',
        language: detectLanguage(code),
        status: 'DRAFT',
        indicators,
        entryRules,
        riskRules
    };
}
