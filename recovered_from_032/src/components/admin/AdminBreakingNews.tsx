  History,
  Activity,
  UserCheck,
  FileText,
  Paperclip,
  Share2,
  BarChart3,
  MousePointerClick
} from 'lucide-react';

export const AdminBreakingNews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics' | 'audit'>('editor');
  const [newsList, setNewsList] = useState<BreakingNewsItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<BreakingNewsAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Admin Role Context
  const [adminRole, setAdminRole] = useState<'super_admin' | 'admin'>('super_admin');
  const [adminName, setAdminName] = useState('Super Admin');