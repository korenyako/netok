/**
 * Formats operator name by removing ASN prefix
 * @param op - Operator string (e.g., "AS3269 Telecom Italia S.p.A.")
 * @returns Formatted operator name (e.g., "Telecom Italia S.p.A.")
 */
export function formatOperator(op?: string | null): string | undefined {
  if (!op) return undefined;
  // Remove leading "AS1234 " if present
  return op.replace(/^AS\d+\s+/i, "").trim();
}
