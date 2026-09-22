import fs from 'fs';
import path from 'path';
import { getDb } from './database.js';

export interface VersionManifest {
  version: string;
  buildId: string;
  minimumSupportedVersion: string;
  forceUpdate: boolean;
  releaseNotes: string[];
  releasedAt: string;
  environment: string;
}

const DEFAULT_MANIFEST: VersionManifest = {
  version: '2.5.0',
  buildId: 'build-20260918-update',
  minimumSupportedVersion: '2.0.0',
  forceUpdate: false,
  releaseNotes: [
    'Moved Left Drawing Toolbar to far left edge of the platform',
    'Integrated Broker Demo Accounts into User Profile panel',
    'Added Currency Strength Meter toggle with Gauge icon',
    'Added Right Action Sidebar with +, Pine, and Alerts'
  ],
  releasedAt: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'production'
};

let currentManifest: VersionManifest = { ...DEFAULT_MANIFEST };
let versionHistory: VersionManifest[] = [{ ...DEFAULT_MANIFEST }];
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized) return;
  initializeVersionManager();
}

/**
 * Initialize Version Manager Database Table
 */
export function initializeVersionManager(): void {
  try {
    const db = getDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS app_version_manifest (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL,
        build_id TEXT NOT NULL,
        min_version TEXT NOT NULL,
        force_update INTEGER NOT NULL DEFAULT 0,
        release_notes TEXT NOT NULL,
        released_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
      );
    `);
    isInitialized = true;

    // Reset any legacy stuck force_update flags
    try {
      db.prepare('UPDATE app_version_manifest SET force_update = 0 WHERE is_active = 1').run();
    } catch {
      // ignore if table empty
    }

    // Check if there is an active record
    const row = db.prepare('SELECT * FROM app_version_manifest WHERE is_active = 1 ORDER BY id DESC LIMIT 1').get() as any;
    if (row) {
      currentManifest = {
        version: row.version,
        buildId: row.build_id,
        minimumSupportedVersion: row.min_version,
        forceUpdate: false,
        releaseNotes: JSON.parse(row.release_notes || '[]'),
        releasedAt: row.released_at,
        environment: process.env.NODE_ENV || 'production'
      };
    } else {
      // Seed default
      db.prepare(`
        INSERT INTO app_version_manifest (version, build_id, min_version, force_update, release_notes, released_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `).run(
        DEFAULT_MANIFEST.version,
        DEFAULT_MANIFEST.buildId,
        DEFAULT_MANIFEST.minimumSupportedVersion,
        0,
        JSON.stringify(DEFAULT_MANIFEST.releaseNotes),
        DEFAULT_MANIFEST.releasedAt
      );
    }
  } catch (err) {
    console.warn('[VersionManager] Database initialization warning, using in-memory manifest:', err);
  }
}

/**
 * Retrieve current active version manifest
 */
export function getVersionManifest(): VersionManifest {
  ensureInitialized();
  return currentManifest;
}

/**
 * Publish a new version release
 */
export function updateVersion(update: {
  version?: string;
  buildId?: string;
  minimumSupportedVersion?: string;
  forceUpdate?: boolean;
  releaseNotes?: string[];
}): VersionManifest {
  ensureInitialized();
  const newManifest: VersionManifest = {
    version: update.version || currentManifest.version,
    buildId: update.buildId || `build-${Date.now()}`,
    minimumSupportedVersion: update.minimumSupportedVersion || currentManifest.minimumSupportedVersion,
    forceUpdate: update.forceUpdate !== undefined ? update.forceUpdate : currentManifest.forceUpdate,
    releaseNotes: update.releaseNotes || currentManifest.releaseNotes,
    releasedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  };

  try {
    const db = getDb();
    db.prepare('UPDATE app_version_manifest SET is_active = 0').run();
    db.prepare(`
      INSERT INTO app_version_manifest (version, build_id, min_version, force_update, release_notes, released_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(
      newManifest.version,
      newManifest.buildId,
      newManifest.minimumSupportedVersion,
      newManifest.forceUpdate ? 1 : 0,
      JSON.stringify(newManifest.releaseNotes),
      newManifest.releasedAt
    );
  } catch (err) {
    console.warn('[VersionManager] Could not persist new version to SQLite:', err);
  }

  versionHistory.unshift({ ...currentManifest });
  currentManifest = newManifest;
  return currentManifest;
}

/**
 * Toggle force update requirement
 */
export function setForceUpdate(force: boolean): VersionManifest {
  return updateVersion({ forceUpdate: force });
}

/**
 * Rollback to previous version if available
 */
export function rollbackVersion(): VersionManifest | null {
  if (versionHistory.length === 0) return null;
  const previous = versionHistory.shift();
  if (!previous) return null;
  
  return updateVersion({
    version: previous.version,
    buildId: previous.buildId,
    minimumSupportedVersion: previous.minimumSupportedVersion,
    forceUpdate: previous.forceUpdate,
    releaseNotes: previous.releaseNotes
  });
}

/**
 * Get history of version releases
 */
export function getVersionHistory(): VersionManifest[] {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM app_version_manifest ORDER BY id DESC LIMIT 20').all() as any[];
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        version: r.version,
        buildId: r.build_id,
        minimumSupportedVersion: r.min_version,
        forceUpdate: Boolean(r.force_update),
        releaseNotes: JSON.parse(r.release_notes || '[]'),
        releasedAt: r.released_at,
        environment: process.env.NODE_ENV || 'production'
      }));
    }
  } catch (err) {
    console.warn('[VersionManager] Could not read history from SQLite:', err);
  }
  return versionHistory;
}
