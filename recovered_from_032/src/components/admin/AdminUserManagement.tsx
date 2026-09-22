  Camera,
  Activity,
  LogOut,
} from 'lucide-react';

interface AdminUserManagementProps {
  users: AppUserProfile[];
  onOpenUserModal: (user: AppUserProfile) => void;
  onUpdateStatus: (userId: string, status: 'active' | 'banned' | 'suspended') => void;
  onLogoutAllDevices: (userId: string) => void;
  lang: Language;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  onOpenUserModal,