import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type ProductPayload = {
  id: number;
  name: string;
  sku: string;
  active_variants?: Array<{
    id: number;
    product_id: number;
    sku: string;
    price: number;
    stock_level: number;
    is_active: boolean;
  }>;
};

type OrderPayload = {
  phone?: string | null;
  address?: string | null;
  shop_id?: number;
  items: Array<{ variant_id: number; quantity: number }>;
};

type CachedOrder = {
  id: number;
  status: string;
  total_amount: number;
  phone: string | null;
  address: string | null;
  created_at: string;
};

type SyncResult = {
  synced: number;
  failed: number;
  pending: number;
  lastSyncAt: string | null;
  issues: Array<{
    outboxId: number;
    reason: string;
    nextAction: string;
  }>;
};

type OutboxRow = {
  id: number;
  event_type: string;
  payload_json: string;
  payload_hash: string | null;
  client_ref: string | null;
  retries: number;
};

export class OfflineStore {
  private readonly dbPath: string;

  constructor(userDataPath: string) {
    fs.mkdirSync(userDataPath, { recursive: true });
    this.dbPath = path.join(userDataPath, "pos-offline.db");
    this.migrate();
  }

  cacheProducts(products: ProductPayload[]): void {
    const now = new Date().toISOString();
    const statements: string[] = ["BEGIN TRANSACTION"]; 

    for (const product of products) {
      statements.push(`
        INSERT INTO products_cache (product_id, name, sku, payload_json, updated_at)
        VALUES (${Number(product.id)}, ${this.q(product.name)}, ${this.q(product.sku)}, ${this.q(JSON.stringify(product))}, ${this.q(now)})
        ON CONFLICT(product_id) DO UPDATE SET
          name=excluded.name,
          sku=excluded.sku,
          payload_json=excluded.payload_json,
          updated_at=excluded.updated_at
      `);

      for (const variant of product.active_variants ?? []) {
        statements.push(`
          INSERT INTO variant_cache (variant_id, product_id, sku, price, stock_level, is_active, updated_at)
          VALUES (
            ${Number(variant.id)},
            ${Number(variant.product_id)},
            ${this.q(variant.sku)},
            ${Number(variant.price)},
            ${Number(variant.stock_level)},
            ${variant.is_active ? 1 : 0},
            ${this.q(now)}
          )
          ON CONFLICT(variant_id) DO UPDATE SET
            product_id=excluded.product_id,
            sku=excluded.sku,
            price=excluded.price,
            stock_level=excluded.stock_level,
            is_active=excluded.is_active,
            updated_at=excluded.updated_at
        `);
      }
    }

    statements.push("COMMIT");
    this.run(statements.join(";\n"));
  }

  getProducts(query: string): ProductPayload[] {
    const normalized = query.trim();
    const sql = normalized
      ? `
        SELECT payload_json
        FROM products_cache
        WHERE lower(name) LIKE '%' || lower(${this.q(normalized)}) || '%'
           OR lower(sku) LIKE '%' || lower(${this.q(normalized)}) || '%'
        ORDER BY product_id DESC
        LIMIT 100
      `
      : "SELECT payload_json FROM products_cache ORDER BY product_id DESC LIMIT 100";

    const rows = this.select<Array<{ payload_json: string }>>(sql) ?? [];
    return rows
      .map((row) => {
        try {
          return JSON.parse(row.payload_json) as ProductPayload;
        } catch {
          return null;
        }
      })
      .filter((value): value is ProductPayload => Boolean(value));
  }

  cacheOrders(orders: CachedOrder[]): void {
    const now = new Date().toISOString();
    const statements = ["BEGIN TRANSACTION"];

    for (const order of orders) {
      statements.push(`
        INSERT INTO orders_cache (order_id, payload_json, updated_at)
        VALUES (${Number(order.id)}, ${this.q(JSON.stringify(order))}, ${this.q(now)})
        ON CONFLICT(order_id) DO UPDATE SET
          payload_json=excluded.payload_json,
          updated_at=excluded.updated_at
      `);
    }

    statements.push("COMMIT");
    this.run(statements.join(";\n"));
  }

  getCachedOrders(): CachedOrder[] {
    const rows = this.select<Array<{ payload_json: string }>>(
      "SELECT payload_json FROM orders_cache ORDER BY order_id DESC LIMIT 300",
    ) ?? [];

    return rows
      .map((row) => {
        try {
          return JSON.parse(row.payload_json) as CachedOrder;
        } catch {
          return null;
        }
      })
      .filter((value): value is CachedOrder => Boolean(value));
  }

  queueOrder(payload: OrderPayload): CachedOrder {
    const now = new Date().toISOString();
    const normalized = this.normalizeOrderPayload(payload);
    const payloadHash = this.computePayloadHash(normalized);
    const existing = this.select<Array<{ id: number; payload_json: string; created_at: string }>>(`
      SELECT id, payload_json, created_at
      FROM outbox
      WHERE event_type = 'order.create'
        AND status = 'pending'
        AND payload_hash = ${this.q(payloadHash)}
      ORDER BY id DESC
      LIMIT 1
    `) ?? [];

    if (existing.length > 0) {
      const existingPayload = JSON.parse(existing[0].payload_json) as OrderPayload;
      return {
        id: Number(existing[0].id) * -1,
        status: "pending_sync",
        total_amount: this.computeTotal(existingPayload),
        phone: existingPayload.phone ?? null,
        address: existingPayload.address ?? null,
        created_at: existing[0].created_at,
      };
    }

    const clientRef = this.generateClientRef();
    const payloadForOutbox = { ...normalized, client_ref: clientRef };
    const total = this.computeTotal(normalized);

    const inserted = this.select<Array<{ id: number }>>(`
      INSERT INTO outbox (event_type, payload_json, payload_hash, client_ref, status, retries, created_at, updated_at)
      VALUES (
        'order.create',
        ${this.q(JSON.stringify(payloadForOutbox))},
        ${this.q(payloadHash)},
        ${this.q(clientRef)},
        'pending',
        0,
        ${this.q(now)},
        ${this.q(now)}
      );
      SELECT last_insert_rowid() AS id;
    `) ?? [{ id: 0 }];

    return {
      id: Number(inserted[0].id) * -1,
      status: "pending_sync",
      total_amount: total,
      phone: normalized.phone ?? null,
      address: normalized.address ?? null,
      created_at: now,
    };
  }

  getPendingOrders(): CachedOrder[] {
    const rows = this.select<Array<{ id: number; payload_json: string; created_at: string }>>(`
      SELECT id, payload_json, created_at
      FROM outbox
      WHERE status = 'pending' AND event_type = 'order.create'
      ORDER BY id DESC
    `) ?? [];

    return rows.map((row) => {
      const payload = JSON.parse(row.payload_json) as OrderPayload;
      return {
        id: Number(row.id) * -1,
        status: "pending_sync",
        total_amount: this.computeTotal(payload),
        phone: payload.phone ?? null,
        address: payload.address ?? null,
        created_at: row.created_at,
      };
    });
  }

  getStatus(online: boolean): { online: boolean; pending: number; lastSyncAt: string | null } {
    const row = this.select<Array<{ pending: number }>>(
      "SELECT COUNT(*) AS pending FROM outbox WHERE status = 'pending'",
    ) ?? [{ pending: 0 }];

    return {
      online,
      pending: Number(row[0].pending),
      lastSyncAt: this.getSyncState("last_sync_at"),
    };
  }

  async sync(apiBaseUrl: string, token: string | null): Promise<SyncResult> {
    const queue = this.select<OutboxRow[]>(`
      SELECT id, event_type, payload_json, payload_hash, client_ref, retries
      FROM outbox
      WHERE status = 'pending'
      ORDER BY id ASC
      LIMIT 100
    `) ?? [];

    let synced = 0;
    let failed = 0;
    const issues: SyncResult["issues"] = [];

    for (const row of queue) {
      try {
        if (row.event_type !== "order.create") {
          const reason = "Unsupported outbox event";
          this.markFailed(Number(row.id), reason);
          issues.push({
            outboxId: Number(row.id),
            reason,
            nextAction: "Update POS app version and retry sync.",
          });
          failed += 1;
          continue;
        }

        const payload = this.normalizeOrderPayload(JSON.parse(row.payload_json) as OrderPayload & { client_ref?: string });
        const payloadHash = this.computePayloadHash(payload);
        const clientRef = row.client_ref || payload.client_ref || this.generateClientRef();

        // Backfill newer schema fields for existing rows before send.
        this.run(`
          UPDATE outbox
          SET payload_json = ${this.q(JSON.stringify({ ...payload, client_ref: clientRef }))},
              payload_hash = ${this.q(payloadHash)},
              client_ref = ${this.q(clientRef)},
              updated_at = ${this.q(new Date().toISOString())}
          WHERE id = ${Number(row.id)}
        `);

        const response = await fetch(`${apiBaseUrl}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "X-Idempotency-Key": clientRef,
          },
          body: JSON.stringify({
            phone: payload.phone ?? null,
            address: payload.address ?? null,
            shop_id: payload.shop_id,
            items: payload.items,
          }),
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "sync failed");
          const reason = `HTTP ${response.status}: ${text.slice(0, 240)}`;
          this.markFailed(Number(row.id), reason);
          issues.push({
            outboxId: Number(row.id),
            reason,
            nextAction: this.recommendAction(response.status),
          });
          failed += 1;
          continue;
        }

        const data = (await response.json().catch(() => null)) as { data?: CachedOrder } | null;
        if (data?.data) {
          this.cacheOrders([data.data]);
        }

        this.run(`DELETE FROM outbox WHERE id = ${Number(row.id)}`);
        synced += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown sync error";
        this.markFailed(Number(row.id), message);
        issues.push({
          outboxId: Number(row.id),
          reason: message,
          nextAction: this.recommendAction(0),
        });
        failed += 1;
      }
    }

    const pendingRow = this.select<Array<{ pending: number }>>(
      "SELECT COUNT(*) AS pending FROM outbox WHERE status = 'pending'",
    ) ?? [{ pending: 0 }];

    if (synced > 0) {
      this.setSyncState("last_sync_at", new Date().toISOString());
    }

    return {
      synced,
      failed,
      pending: Number(pendingRow[0].pending),
      lastSyncAt: this.getSyncState("last_sync_at"),
      issues,
    };
  }

  private migrate(): void {
    this.run(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS products_cache (
        product_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS variant_cache (
        variant_id INTEGER PRIMARY KEY,
        product_id INTEGER NOT NULL,
        sku TEXT NOT NULL,
        price REAL NOT NULL,
        stock_level INTEGER NOT NULL,
        is_active INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders_cache (
        order_id INTEGER PRIMARY KEY,
        payload_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS outbox (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        payload_hash TEXT,
        client_ref TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        retries INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_outbox_status_created_at ON outbox(status, created_at);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_outbox_client_ref_unique ON outbox(client_ref);
      CREATE INDEX IF NOT EXISTS idx_outbox_event_hash_status ON outbox(event_type, payload_hash, status);
      CREATE INDEX IF NOT EXISTS idx_products_cache_name ON products_cache(name);
    `);

    this.ensureOutboxColumns();
  }

  private markFailed(id: number, error: string): void {
    const now = new Date().toISOString();
    this.run(`
      UPDATE outbox
      SET retries = retries + 1,
          last_error = ${this.q(error)},
          updated_at = ${this.q(now)},
          status = CASE WHEN retries + 1 >= 10 THEN 'dead' ELSE 'pending' END
      WHERE id = ${id}
    `);
  }

  private setSyncState(key: string, value: string): void {
    const now = new Date().toISOString();
    this.run(`
      INSERT INTO sync_state (key, value, updated_at)
      VALUES (${this.q(key)}, ${this.q(value)}, ${this.q(now)})
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at
    `);
  }

  private getSyncState(key: string): string | null {
    const row = this.select<Array<{ value: string }>>(
      `SELECT value FROM sync_state WHERE key = ${this.q(key)} LIMIT 1`,
    ) ?? [];

    return row[0]?.value ?? null;
  }

  private computeTotal(payload: OrderPayload): number {
    if (payload.items.length === 0) return 0;

    const variantIds = payload.items.map((item) => Number(item.variant_id));
    const sql = `SELECT variant_id, price FROM variant_cache WHERE variant_id IN (${variantIds.join(",")})`;
    const rows = this.select<Array<{ variant_id: number; price: number }>>(sql) ?? [];
    const prices = new Map(rows.map((row) => [Number(row.variant_id), Number(row.price)]));

    return payload.items.reduce((sum, item) => sum + (prices.get(Number(item.variant_id)) ?? 0) * Number(item.quantity), 0);
  }

  private q(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }

  private run(sql: string): void {
    execFileSync("sqlite3", [this.dbPath, sql], {
      stdio: "pipe",
      encoding: "utf-8",
    });
  }

  private select<T>(sql: string): T | null {
    const output = execFileSync("sqlite3", ["-json", this.dbPath, sql], {
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();

    if (!output) return null;
    return JSON.parse(output) as T;
  }

  private generateClientRef(): string {
    return randomUUID();
  }

  private ensureOutboxColumns(): void {
    const columns = this.select<Array<{ name: string }>>("PRAGMA table_info('outbox')") ?? [];
    const names = new Set(columns.map((column) => String(column.name)));

    if (!names.has("payload_hash")) {
      this.run("ALTER TABLE outbox ADD COLUMN payload_hash TEXT");
    }
    if (!names.has("client_ref")) {
      this.run("ALTER TABLE outbox ADD COLUMN client_ref TEXT");
    }
  }

  private normalizeOrderPayload(payload: OrderPayload & { client_ref?: string }): OrderPayload & { client_ref?: string } {
    const consolidated = new Map<number, number>();
    for (const item of payload.items ?? []) {
      const variantId = Number(item.variant_id);
      const qty = Number(item.quantity);
      if (!Number.isFinite(variantId) || variantId <= 0 || !Number.isFinite(qty) || qty <= 0) {
        continue;
      }
      consolidated.set(variantId, (consolidated.get(variantId) ?? 0) + Math.floor(qty));
    }

    const items = Array.from(consolidated.entries())
      .sort(([a], [b]) => a - b)
      .map(([variant_id, quantity]) => ({ variant_id, quantity }));

    return {
      phone: payload.phone ?? null,
      address: payload.address ?? null,
      shop_id: payload.shop_id,
      items,
      ...(payload.client_ref ? { client_ref: payload.client_ref } : {}),
    };
  }

  private computePayloadHash(payload: OrderPayload): string {
    const normalized = this.normalizeOrderPayload(payload);
    const canonical = JSON.stringify({
      phone: normalized.phone ?? null,
      address: normalized.address ?? null,
      shop_id: normalized.shop_id,
      items: normalized.items,
    });
    return createHash("sha256").update(canonical).digest("hex");
  }

  private recommendAction(statusCode: number): string {
    if (statusCode === 401 || statusCode === 403) {
      return "Please log in again and run Sync Now.";
    }
    if (statusCode === 422 || statusCode === 409) {
      return "Review the order data in POS and correct the item/stock conflict before retrying.";
    }
    if (statusCode >= 500) {
      return "Server is currently unavailable. Wait a moment and retry Sync Now.";
    }
    return "Check internet connection, then retry using Sync Now.";
  }
}
