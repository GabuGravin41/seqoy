import { getDb, schema } from "@/db";
import type { AuthedActor } from "@/lib/rbac/server";

const memoryAuditLog: Array<Record<string, unknown>> = [];

/**
 * Records who did what to which record — required for any real health-data
 * platform, and previously nonexistent (no audit trail of who viewed or
 * changed patient data existed anywhere in the system).
 */
export async function logAudit(
  actor: AuthedActor,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const entry = {
    actorUserId: actor.userId,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    metadata,
  };

  const db = getDb();
  if (!db) {
    memoryAuditLog.push({ ...entry, createdAt: new Date().toISOString() });
    return;
  }
  await db.insert(schema.auditLogs).values(entry);
}
