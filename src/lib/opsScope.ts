/**
 * People who only use the Operations page, limited to certain cohorts.
 * They keep their account rights; this only trims what they see and where they land.
 */
export interface OpsScope { cohorts: number[] }

const OPS_ONLY: Record<string, OpsScope> = {
  "david.gbadebo4@gmail.com": { cohorts: [4] },
};

export function getOpsScope(email?: string | null): OpsScope | null {
  if (!email) return null;
  return OPS_ONLY[email.trim().toLowerCase()] ?? null;
}
