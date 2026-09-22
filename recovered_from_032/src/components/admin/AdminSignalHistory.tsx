} from 'lucide-react';

interface AdminSignalHistoryProps {
  signals: ForexSignal[];
  appUsers: AppUserProfile[];
  onSelectSignalForStats?: (signal: ForexSignal) => void;
}

export const AdminSignalHistory: React.FC<AdminSignalHistoryProps> = ({
  signals,
  appUsers,
  onSelectSignalForStats,
}) => {
  // Filters
  const [searchPair, setSearchPair] = useState<string>('ALL');
  const [searchStrategy, setSearchStrategy] = useState<string>('ALL');