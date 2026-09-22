  Sparkles,
} from 'lucide-react';
import { globalAutoEngine } from '../../engine/AutoSignalEngine';

interface AdminAutoEngineControlProps {
  status: EngineSystemStatus;
  strategies: StrategyPlugin[];
  qualityConfig: QualityFilterConfig;
  logs: EngineAuditLog[];
  onToggleEngineRunning: () => void;
  onToggleStrategy: (strategyId: string) => void;
  onUpdateStrategyParams: (strategyId: string, params: StrategyPlugin['params']) => void;
  onUpdateQualityConfig: (config: Partial<QualityFilterConfig>) => void;
  onTriggerManualScan: () => void;
  onAddCustomStrategy: (newStrat: StrategyPlugin) => void;
  lang: Language;
}

export const AdminAutoEngineControl: React.FC<AdminAutoEngineControlProps> = ({
  status,
  strategies,