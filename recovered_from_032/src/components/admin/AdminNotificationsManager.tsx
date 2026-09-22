import React, { useState } from 'react';
import { NotificationCampaign, Language } from '../../types';
import { PAIRS_DATA } from '../../data/pairs';
import { Send, Clock, Users, Globe, Bell, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

interface AdminNotificationsManagerProps {
  campaigns: NotificationCampaign[];
  onSendCampaign: (campaign: Omit<NotificationCampaign, 'id' | 'sentCount' | 'openCount' | 'openRate'>) => void;
  lang: Language;
}

export const AdminNotificationsManager: React.FC<AdminNotificationsManagerProps> = ({
  campaigns,
  onSendCampaign,
  lang,
}) => {
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [targetGroup, setTargetGroup] = useState<
    'all' | 'vip' | 'free' | 'pair_followers' | 'country' | 'language'
  >('all');
  const [targetValue, setTargetValue] = useState('XAU/USD');
  const [isScheduled, setIsScheduled] = useState(false);