import React from 'react';
import { ScreenshotEvent, ForexSignal, AppUserProfile, SignalMetrics } from '../../types';
import { Camera, Flame, TrendingUp, Users, Smartphone, Trophy, Award, AlertTriangle } from 'lucide-react';

interface AdminScreenshotAnalyticsProps {
  screenshots: ScreenshotEvent[];
  signals: ForexSignal[];
  users: AppUserProfile[];
  metricsMap: Record<string, SignalMetrics>;
  onOpenSignalStats: (signal: ForexSignal) => void;
  onOpenUserModal: (user: AppUserProfile) => void;
}

export const AdminScreenshotAnalytics: React.FC<AdminScreenshotAnalyticsProps> = ({
  screenshots,
  signals,
  users,
  metricsMap,
  onOpenSignalStats,
  onOpenUserModal,
}) => {
  // Aggregate stats
  const totalScreenshotsToday = 142;
  const totalScreenshotsThisWeek = 890;
  const totalScreenshotsThisMonth = 3450;