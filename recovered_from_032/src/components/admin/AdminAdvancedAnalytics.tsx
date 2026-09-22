import React from 'react';
import { AppUserProfile, ForexSignal, Language } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Users, Smartphone, Globe } from 'lucide-react';

interface AdminAdvancedAnalyticsProps {
  users: AppUserProfile[];
  signals: ForexSignal[];
  lang: Language;
}

export const AdminAdvancedAnalytics: React.FC<AdminAdvancedAnalyticsProps> = ({