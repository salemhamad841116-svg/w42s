import { Express, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { BreakingNewsItem, BreakingNewsAuditLog } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const NEWS_FILE = path.join(DATA_DIR, 'breaking_news.json');
const AUDIT_FILE = path.join(DATA_DIR, 'breaking_news_audit.json');

// Initial seed
const INITIAL_NEWS: BreakingNewsItem[] = [
  {
    id: 'bn-001',
    title: '🚨 عاجل: الفيدرالي الأمريكي يعلن قرار الفائدة ومؤتمر صحفي طارئ',
    content: 'قرر مجلس الفيدرالي الأمريكي إبقاء أسعار الفائدة عند مستوياتها الحالية مع إشارات واضحة إلى خفض وشيك في الاجتماع القادم. تشهد أسواق العملات والذهب تقلبات حادة في الوقت الحالي.',
    category: 'breaking',
    cardColor: 'red',
    icon: 'AlertTriangle',
    priority: 'urgent',
    audience: 'all',
    status: 'published',
    pinned: true,
    soundAlert: true,
    publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    viewersCount: 1420,
    dismissalsCount: 38,
    readMoreClicksCount: 215,
    publishedBy: {
      id: 'admin-01',
      name: 'Super Admin',
      email: 'admin@forex-signals.com',
      role: 'super_admin'
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'bn-002',
    title: '📢 تحديث جديد: إضافة خوارزمية التداول الذكي Camarilla V4',
    content: 'تم تحديث محرك التداول الآلي داخل التطبيق ليدعم استراتيجية كاماريلا الرقمية المتقدمة لجميع مستخدمي باقة VIP والذهب.',
    category: 'update',
    cardColor: 'emerald',
    icon: 'CheckCircle2',
    priority: 'important',
    audience: 'gold',
    status: 'published',
    pinned: false,
    soundAlert: false,
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    viewersCount: 890,
    dismissalsCount: 12,
    readMoreClicksCount: 140,
    publishedBy: {
      id: 'admin-02',
      name: 'Senior Analyst Admin',
      email: 'analyst@forex-signals.com',
      role: 'admin'
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  }
];

class BreakingNewsBackendService {
  private newsList: BreakingNewsItem[] = [];
  private auditLogs: BreakingNewsAuditLog[] = [];
  private sseClients: Response[] = [];

  constructor() {
    this.ensureDataDir();
    this.loadData();
    this.startAutoArchiveScheduler();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.error('Failed to create data dir:', e);
      }
    }
  }

  private loadData() {
    try {
      if (fs.existsSync(NEWS_FILE)) {
        const content = fs.readFileSync(NEWS_FILE, 'utf-8');
        this.newsList = JSON.parse(content);
      } else {
        this.newsList = INITIAL_NEWS;
        this.saveNewsData();
      }

      if (fs.existsSync(AUDIT_FILE)) {
        const auditContent = fs.readFileSync(AUDIT_FILE, 'utf-8');
        this.auditLogs = JSON.parse(auditContent);
      } else {
        this.auditLogs = [];
        this.saveAuditLogs();
      }
    } catch (e) {
      console.error('Failed to load breaking news backend data:', e);
      this.newsList = INITIAL_NEWS;
    }
  }

  private saveNewsData() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(NEWS_FILE, JSON.stringify(this.newsList, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save news file:', e);
    }
  }

  private saveAuditLogs() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(AUDIT_FILE, JSON.stringify(this.auditLogs, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save audit file:', e);
    }
  }

  private addAuditLog(
    newsId: string,
    newsTitle: string,
    action: BreakingNewsAuditLog['action'],
    adminName: string = 'Super Admin',
    role: string = 'super_admin',
    details?: string
  ) {
    const log: BreakingNewsAuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      newsId,
      newsTitle,
      action,
      performedBy: adminName,
      role,
      timestamp: new Date().toISOString(),
      details,
    };
    this.auditLogs.unshift(log);
    this.saveAuditLogs();
  }

  private autoArchiveExpired() {
    const now = new Date();
    let updated = false;

    this.newsList.forEach((item) => {
      if (item.status === 'published' && item.expiresAt) {
        if (new Date(item.expiresAt) < now) {
          item.status = 'archived';
          item.updatedAt = now.toISOString();
          updated = true;
          this.addAuditLog(item.id, item.title, 'archive', 'System Scheduler', 'system', 'Auto-archived due to expiration');
        }
      }
    });

    if (updated) {
      this.saveNewsData();
      this.broadcastToClients({ type: 'AUTO_ARCHIVE_SWEEP', allNews: this.newsList });
    }
  }

  private startAutoArchiveScheduler() {
    // Run every 60 seconds
    setInterval(() => {
      this.autoArchiveExpired();
    }, 60000);
  }

  private broadcastToClients(data: object) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    this.sseClients.forEach((client, idx) => {
      try {
        client.write(payload);
      } catch (e) {
        console.warn('Failed to send SSE to client:', idx, e);
      }
    });
  }

  private checkAdminPermission(req: Request): { authorized: boolean; adminInfo: { name: string; email: string; role: string } } {
    const roleHeader = (req.headers['x-admin-role'] || req.headers['x-user-role'] || 'super_admin') as string;
    const adminNameHeader = (req.headers['x-admin-name'] || 'Super Admin') as string;
    const adminEmailHeader = (req.headers['x-admin-email'] || 'admin@forex-signals.com') as string;

    const isAllowed = roleHeader === 'super_admin' || roleHeader === 'admin';

    return {
      authorized: isAllowed,
      adminInfo: {
        name: adminNameHeader,
        email: adminEmailHeader,
        role: roleHeader,
      },
    };
  }

  public mountRoutes(app: Express) {
    // 1. Real-time SSE Stream Endpoint
    app.get('/api/breaking-news/stream', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      // Send initial snapshot
      this.autoArchiveExpired();
      res.write(`data: ${JSON.stringify({ type: 'INITIAL_SYNC', allNews: this.newsList })}\n\n`);

      this.sseClients.push(res);

      req.on('close', () => {
        this.sseClients = this.sseClients.filter((client) => client !== res);
      });
    });

    // 2. Get All News or Active News
    app.get('/api/breaking-news', (req: Request, res: Response) => {
      this.autoArchiveExpired();
      const userTier = (req.query.tier as string) || 'all';
      const statusFilter = (req.query.status as string) || 'all';

      if (statusFilter === 'active_client') {
        const active = this.newsList.filter((item) => {
          if (item.status !== 'published') return false;
          if (item.expiresAt && new Date(item.expiresAt) < new Date()) return false;
          return true;
        });
        return res.json({ success: true, news: active });
      }

      res.json({ success: true, news: this.newsList });
    });

    // 3. Create News (Admin Only)
    app.post('/api/breaking-news', (req: Request, res: Response) => {
      const { authorized, adminInfo } = this.checkAdminPermission(req);
      if (!authorized) {
        return res.status(403).json({ success: false, error: 'غير مصرح لك بنشر الأخبار (Permission Denied)' });
      }

      const body = req.body || {};
      const now = new Date().toISOString();

      const newItem: BreakingNewsItem = {
        id: `bn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: body.title || 'خبر عاجل جديد',
        content: body.content || '',
        category: body.category || 'breaking',
        cardColor: body.cardColor || 'red',
        icon: body.icon || 'AlertTriangle',
        imageUrl: body.imageUrl,
        attachments: body.attachments || [],
        priority: body.priority || 'urgent',
        audience: body.audience || 'all',
        targetCountry: body.targetCountry,
        publishedAt: body.status === 'published' ? now : body.publishedAt,
        scheduledAt: body.scheduledAt,
        expiresAt: body.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: body.status || 'published',
        pinned: body.pinned !== undefined ? body.pinned : true,
        soundAlert: body.soundAlert !== undefined ? body.soundAlert : true,
        viewersCount: 0,
        dismissalsCount: 0,
        readMoreClicksCount: 0,
        publishedBy: adminInfo,
        createdAt: now,
        updatedAt: now,
      };

      this.newsList.unshift(newItem);
      this.saveNewsData();

      this.addAuditLog(newItem.id, newItem.title, newItem.status === 'published' ? 'publish' : 'create', adminInfo.name, adminInfo.role);

      this.broadcastToClients({
        type: 'NEWS_CREATED',
        newsItem: newItem,
        allNews: this.newsList,
      });

      res.json({ success: true, newsItem: newItem });
    });

    // 4. Update News (Admin Only)
    app.put('/api/breaking-news/:id', (req: Request, res: Response) => {
      const { authorized, adminInfo } = this.checkAdminPermission(req);
      if (!authorized) {
        return res.status(403).json({ success: false, error: 'غير مصرح لك بتعديل الأخبار' });
      }

      const { id } = req.params;
      const index = this.newsList.findIndex((n) => n.id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'الخبر غير موجود' });
      }

      const oldItem = this.newsList[index];
      const updates = req.body || {};
      const now = new Date().toISOString();
      const isNewlyPublished = oldItem.status !== 'published' && updates.status === 'published';

      const updatedItem: BreakingNewsItem = {
        ...oldItem,
        ...updates,
        updatedAt: now,
        publishedAt: isNewlyPublished ? now : (updates.publishedAt || oldItem.publishedAt),
      };

      this.newsList[index] = updatedItem;
      this.saveNewsData();

      this.addAuditLog(id, updatedItem.title, isNewlyPublished ? 'publish' : 'update', adminInfo.name, adminInfo.role);

      this.broadcastToClients({
        type: 'NEWS_UPDATED',
        newsItem: updatedItem,
        allNews: this.newsList,
      });

      res.json({ success: true, newsItem: updatedItem });
    });

    // 5. Publish Now
    app.post('/api/breaking-news/:id/publish', (req: Request, res: Response) => {
      const { authorized, adminInfo } = this.checkAdminPermission(req);
      if (!authorized) return res.status(403).json({ success: false, error: 'غير مصرح' });

      const { id } = req.params;
      const item = this.newsList.find((n) => n.id === id);
      if (!item) return res.status(404).json({ success: false, error: 'غير موجود' });

      const now = new Date().toISOString();
      item.status = 'published';
      item.publishedAt = now;
      item.updatedAt = now;
      this.saveNewsData();

      this.addAuditLog(id, item.title, 'publish', adminInfo.name, adminInfo.role);

      this.broadcastToClients({
        type: 'NEWS_PUBLISHED',
        newsItem: item,
        allNews: this.newsList,
      });

      res.json({ success: true, newsItem: item });
    });

    // 6. Unpublish
    app.post('/api/breaking-news/:id/unpublish', (req: Request, res: Response) => {
      const { authorized, adminInfo } = this.checkAdminPermission(req);
      if (!authorized) return res.status(403).json({ success: false, error: 'غير مصرح' });

      const { id } = req.params;
      const item = this.newsList.find((n) => n.id === id);
      if (!item) return res.status(404).json({ success: false, error: 'غير موجود' });

      item.status = 'draft';
      item.updatedAt = new Date().toISOString();
      this.saveNewsData();

      this.addAuditLog(id, item.title, 'unpublish', adminInfo.name, adminInfo.role);

      this.broadcastToClients({
        type: 'NEWS_UNPUBLISHED',
        newsItem: item,
        allNews: this.newsList,
      });

      res.json({ success: true, newsItem: item });
    });

    // 7. Republish
    app.post('/api/breaking-news/:id/republish', (req: Request, res: Response) => {
      const { authorized, adminInfo } = this.checkAdminPermission(req);
      if (!authorized) return res.status(403).json({ success: false, error: 'غير مصرح' });

      const { id } = req.params;
      const item = this.newsList.find((n) => n.id === id);
      if (!item) return res.status(404).json({ success: false, error: 'غير موجود' });

      const now = new Date().toISOString();
      item.status = 'published';
      item.publishedAt = now;
      item.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      item.updatedAt = now;
      this.saveNewsData();

      this.addAuditLog(id, item.title, 'republish', adminInfo.name, adminInfo.role);

      this.broadcastToClients({
        type: 'NEWS_REPUBLISHED',
        newsItem: item,
        allNews: this.newsList,
      });

      res.json({ success: true, newsItem: item });
    });

    // 8. Delete News
    app.delete('/api/breaking-news/:id', (req: Request, res: Response) => {
      const { authorized, adminInfo } = this.checkAdminPermission(req);
      if (!authorized) return res.status(403).json({ success: false, error: 'غير مصرح' });

      const { id } = req.params;
      const index = this.newsList.findIndex((n) => n.id === id);
      if (index === -1) return res.status(404).json({ success: false, error: 'غير موجود' });

      const deletedItem = this.newsList[index];
      this.newsList.splice(index, 1);
      this.saveNewsData();

      this.addAuditLog(id, deletedItem.title, 'delete', adminInfo.name, adminInfo.role);

      this.broadcastToClients({
        type: 'NEWS_DELETED',
        deletedId: id,
        allNews: this.newsList,
      });

      res.json({ success: true, deletedId: id });
    });

    // 9. Track Analytics (Views, Dismissals, Read More clicks)
    app.post('/api/breaking-news/:id/track', (req: Request, res: Response) => {
      const { id } = req.params;
      const { action } = req.body || {};

      const item = this.newsList.find((n) => n.id === id);
      if (!item) return res.status(404).json({ success: false, error: 'غير موجود' });

      if (action === 'view') {
        item.viewersCount += 1;
      } else if (action === 'dismiss') {
        item.dismissalsCount += 1;
      } else if (action === 'read_more') {
        item.readMoreClicksCount = (item.readMoreClicksCount || 0) + 1;
      }

      this.saveNewsData();
      res.json({
        success: true,
        stats: {
          viewersCount: item.viewersCount,
          dismissalsCount: item.dismissalsCount,
          readMoreClicksCount: item.readMoreClicksCount,
        },
      });
    });

    // 10. Audit Logs
    app.get('/api/breaking-news/audit-logs', (req: Request, res: Response) => {
      res.json({ success: true, auditLogs: this.auditLogs });
    });
  }
}

export const breakingNewsBackendService = new BreakingNewsBackendService();
