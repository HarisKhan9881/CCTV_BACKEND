import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { SQLI_OPTIONS, SqlSanitizationMiddlewareOptions } from '../types/sql-sanitization.token';

type ScanHit = { keyPath: string; value: string; pattern: string };

const KEYWORDS = ['select', 'insert', 'update', 'delete', 'drop', 'alter', 'truncate', 'rename', 'create',
  'replace', 'merge', 'exec', 'execute', 'grant', 'revoke', 'union', 'having', 'into', 'load_file'
  , 'outfile', 'dumpfile', 'xp_cmdshell', 'declare'];

const HARD_PATTERNS: RegExp[] = [
  /(--|#)\s*$/m,
  /\/\*[^]*?\*\//m,
  /;\s*(select|insert|update|delete|drop|alter|truncate|create)\b/i,
  /\bunion\b\s+\bselect\b/i,
  /(?:')\s*or\s*'?\d+'?\s*=\s*'?\d+'?/i,
  /(?:"|\')\s*;\s*--/i,
  /\b(insert|select|update|delete|drop|alter|truncate|create)\b/i // NEW: keyword pattern
];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function flattenEntries(obj: unknown, base = '', out: Array<{ keyPath: string; val: unknown }> = []) {
  if (isPlainObject(obj)) for (const [k, v] of Object.entries(obj)) flattenEntries(v, base ? `${base}.${k}` : k, out);
  else if (Array.isArray(obj)) obj.forEach((v, i) => flattenEntries(v, `${base}[${i}]`, out));
  else out.push({ keyPath: base, val: obj });
  return out;
}

function toStr(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return null;
  }
}

function scanForSqlInjection(all: Record<string, unknown>): ScanHit[] {
  const hits: ScanHit[] = [];
  for (const { keyPath, val } of flattenEntries(all)) {
    const s = toStr(val);
    if (!s) continue;
    const sample = s.slice(0, 2000);
    for (const re of HARD_PATTERNS) if (re.test(sample)) {
      hits.push({ keyPath, value: sample, pattern: String(re) });
      break;
    }
    if (hits.length && hits[hits.length - 1]?.keyPath === keyPath) continue;
    const hasKeyword = KEYWORDS.some(k => new RegExp(`\\b${k}\\b`, 'i').test(sample));

    if (hasKeyword) {
      hits.push({ keyPath, value: sample, pattern: 'keyword detected' });
    }
  }
  return hits;
}

function pickHeaders(h: Record<string, unknown>, keys: string[]) {
  const o: Record<string, unknown> = {};
  for (const k of keys) if (h[k] != null) o[k] = h[k];
  return o;
}

@Injectable()
export class SqlSantizationMiddleware implements NestMiddleware {

  private readonly logger = new Logger(SqlSantizationMiddleware.name);

  constructor(@Inject(SQLI_OPTIONS) private readonly opts: SqlSanitizationMiddlewareOptions) {
  }

  use(req: any, res: any, next: () => void) {

    if (this.opts.exclude?.some(x => typeof x === 'string' ? req.path.startsWith(x) : x.test(req.path))) {
      return next();
    }

    const len = Number(req.headers['content-length'] ?? 0);
    if (this.opts.maxBytes && len > this.opts.maxBytes) return next();

    const payload = {
      query: req.query,
      params: req.params,
      body: req.body,
      headers: pickHeaders(req.headers as any, this.opts.headerKeys ?? ['authorization','cookie','x-user','x-api-key']),
    };

    const hits = scanForSqlInjection(payload);

    if (hits.length === 0) return next();

    const detail = hits.slice(0, 3).map(h => ({ keyPath: h.keyPath, pattern: h.pattern }));
    const msg = `Blocked possible SQL injection on ${req.method} ${req.originalUrl}`;
    if (this.opts.log !== false) {
      const line = `${msg} :: ${JSON.stringify(detail)}`;
      this.opts.log === 'error' ? this.logger.error(line) : this.logger.warn(line);
    }

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: this.opts.blockMessage ?? 'Request rejected by SQL injection guard.',
      detail,
    });
  }
}
