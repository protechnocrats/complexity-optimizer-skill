/** All permission names. The product defines 40 of them. */
export const PERMISSIONS = [
  "orders.read", "orders.write", "orders.refund", "orders.export", "orders.delete",
  "catalog.read", "catalog.write", "catalog.publish", "catalog.import", "catalog.delete",
  "customers.read", "customers.write", "customers.merge", "customers.export", "customers.delete",
  "billing.read", "billing.write", "billing.refund", "billing.export", "billing.settings",
  "reports.read", "reports.create", "reports.share", "reports.schedule", "reports.delete",
  "users.read", "users.invite", "users.suspend", "users.roles", "users.delete",
  "support.read", "support.reply", "support.assign", "support.close", "support.export",
  "settings.read", "settings.write", "settings.integrations", "settings.security", "settings.audit",
] as const;

/** Checks a request's granted permissions. Runs on every API request. */
export function hasAll(granted: string[], required: string[]): boolean {
  return required.every((permission) => granted.includes(permission));
}
