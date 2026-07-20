import "server-only";
import { db } from "@/lib/db";

// Fire-and-forget: an audit failure must never fail the mutation it records.
export const audit = async (
  userId: string | null,
  action: string,
  entity: string,
  detail?: unknown,
): Promise<void> => {
  try {
    await db.auditLog.create({
      data: { userId, action, entity, detail: detail === undefined ? undefined : (detail as object) },
    });
  } catch (err) {
    console.error("[audit] failed to record", action, entity, err);
  }
};
