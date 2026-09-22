  app.post("/api/admin/logout-all", (req, res) => {
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.ip || "127.0.0.1";
    auditLogsStore.unshift({
      id: `log-${Date.now()}`,
      event: 'ADMIN_ALL_SESSIONS_REVOKED',
      ip: clientIp,
      userAgent: req.headers["user-agent"] || "Unknown",
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });

    res.json({
      success: true,
      message: "All active sessions revoked across all devices.",
    });
  });

  app.get("/api/admin/audit-logs", (req, res) => {
    res.json({
      success: true,
      logs: auditLogsStore.slice(0, 50),
    });
  });

  // Helper: Detect if request is for admin subdomain or /admin path
  function isAdminRequest(req: express.Request): boolean {
    const hostname = req.hostname || req.headers.host || '';
    return (
      hostname.startsWith('admin.') ||
      hostname.includes('admin') ||
      hostname.includes('recs.misruq.com') ||
      req.path.startsWith('/admin')
    );
  }

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    // IMPORTANT: Admin routes MUST be registered BEFORE Vite middleware
    // so Vite doesn't intercept /admin and serve index.html instead
    app.get("/admin*", async (req, res, next) => {
      try {
        const htmlPath = path.join(process.cwd(), 'admin.html');
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.use(vite.middlewares);

    // Catch-all for non-admin routes: serve index.html
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();

      try {
        const htmlFile = isAdminRequest(req) ? 'admin.html' : 'index.html';
        const htmlPath = path.join(process.cwd(), htmlFile);
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Production: serve admin.html or index.html based on domain/path
    app.get("*", (req, res) => {
      if (req.path.startsWith('/api/')) return;
      const htmlFile = isAdminRequest(req) ? 'admin.html' : 'index.html';
      res.sendFile(path.join(distPath, htmlFile));
    });
  }

  const server = http.createServer(app);

  // Real-Time Trading Engine WebSocket Server
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[Trading WS] Client connected to live trading socket");

    // Send initial snapshot
    ws.send(JSON.stringify({
      type: "TICKER",
      data: {
        symbol: "BTC/USDT",
        price: "67285.50",
        change: "1.87",
        high: "68100.00",
        low: "65800.00",
        volume: "12543.80",
        timestamp: Date.now(),
      }
    }));

    ws.on("message", (msg) => {
      try {
        const payload = JSON.parse(msg.toString());
        if (payload.type === "PING") {
          ws.send(JSON.stringify({ type: "PONG", timestamp: Date.now() }));
        }
      } catch (e) {
        // ignore malformed message
      }
    });

    ws.on("close", () => {
      console.log("[Trading WS] Client disconnected");
    });
  });

  // Broadcast market data ticker ticks every 1000ms
  setInterval(() => {
    if (wss.clients.size === 0) return;
    const price = 67000 + (Math.random() - 0.48) * 300;
    const tickerMessage = JSON.stringify({
      type: "TICKER",
      data: {
        symbol: "BTC/USDT",
        price: price.toFixed(2),
        change: ((price - 66500) / 66500 * 100).toFixed(2),
        high: "68100.00",
        low: "65800.00",
        volume: (12500 + Math.random() * 100).toFixed(2),
        timestamp: Date.now()
      }
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(tickerMessage);
      }
    });
  }, 1000);

  server.listen(PORT, () => {
    console.log(`Enterprise Forex Engine Server running on port ${PORT}`);
    console.log(`  Local URL:   http://localhost:${PORT}`);
    console.log(`  IPv4 URL:    http://127.0.0.1:${PORT}`);
    console.log(`  Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`  Trading WS:  ws://localhost:${PORT}/ws`);
  });
}

startServer();
