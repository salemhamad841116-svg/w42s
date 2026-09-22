import React, { useState } from 'react';
import { AuditLogEntry, Language } from '../../types';
import { ShieldCheck, Lock, Clock, Search, Filter, AlertTriangle } from 'lucide-react';

interface AdminAuditLogsProps {
  auditLogs: AuditLogEntry[];
  lang: Language;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ auditLogs, lang }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.adminName.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ip.includes(q)
      );
    }
    return true;