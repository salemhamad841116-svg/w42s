import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../data/translations';
import { PAIRS_DATA, PAIR_NAMES_AR } from '../data/pairs';
import {
  TrendingUp,
  BarChart3,
  Archive,
  Star,
  Shield,
  ShieldAlert,
  Radio,
  Activity,
  Bell,
  BellRing,
  Globe,
  LayoutGrid,
  Plus,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Zap,
  Search,
  Filter,
  RotateCcw,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'active' | 'archive' | 'analytics' | 'favorites';
  setActiveTab: (tab: 'active' | 'archive' | 'analytics' | 'favorites') => void;
  lang: Language;
  onToggleLang: () => void;
  isAdmin: boolean;
  onToggleAdmin: (tab?: string) => void;
  displayMode: 'banner' | 'modern';
  onToggleDisplayMode: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  priceAlertsCount?: number;
  onOpenPriceAlerts?: () => void;
  onOpenNewSignalModal: () => void;
  favoritesCount: number;
  currentDomainMode?: 'user' | 'admin';

  // Search & Filter Props
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPair: string;
  setSelectedPair: (p: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedTrend: string;
  setSelectedTrend: (trend: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({