import React from 'react';
import { AppUserProfile, ForexSignal, NotificationCampaign, ScreenshotEvent } from '../../types';
import {
  Users,
  Activity,
  Zap,
  CheckCircle2,
  Bell,
  Eye,
  TrendingUp,
  Camera,
  Globe,
  Smartphone,
  ShieldCheck,
  UserPlus,
  Flame,
  Star,
} from 'lucide-react';

interface AdminOverviewDashboardProps {
  users: AppUserProfile[];
  signals: ForexSignal[];
  campaigns: NotificationCampaign[];
  screenshots: ScreenshotEvent[];
  onNavigateTab: (tab: string) => void;
  onOpenUserModal: (user: AppUserProfile) => void;
}

export const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({
  users,
  signals,
  campaigns,
  screenshots,
  onNavigateTab,
  onOpenUserModal,
}) => {
  // Real-time calculations
  const totalUsersCount = users.length;
  const onlineUsersCount = users.filter((u) => u.isOnline).length;
  const activeSignalsCount = signals.filter((s) => s.status === 'active' || s.status === 'new').length;
  const closedSignalsCount = signals.filter((s) => s.status !== 'active' && s.status !== 'new').length;
  const totalSentNotifs = campaigns.reduce((acc, c) => acc + c.sentCount, 0);

  const freeSubscribersCount = users.filter((u) => u.subscriptionTier === 'free').length;
  const paidSubscribersCount = users.filter((u) => u.subscriptionTier !== 'free').length;

  // New users breakdowns
  const newUsersToday = 14;
  const newUsersThisWeek = 82;
  const newUsersThisMonth = 340;

  // Top watched pairs
  const topWatchedPairs = [
    { pair: 'XAU/USD (الذهب)', count: 2450, percentage: 95 },
    { pair: 'EUR/USD', count: 1890, percentage: 88 },
    { pair: 'GBP/USD', count: 1420, percentage: 72 },
    { pair: 'USD/JPY', count: 980, percentage: 55 },
    { pair: 'Oil (النفط)', count: 810, percentage: 48 },
  ];
