import crypto from "crypto";

export function generateEventHash(
  shipmentId: string,
  status: string,
  description: string,
  location: string | null,
  occurredAt: Date,
): string {
  const loc = location ? location.trim().toLowerCase() : "";

  // Formatando a string exatamente como definimos na regra arquitetural
  const rawString = `${shipmentId}|${status.trim().toLowerCase()}|${description.trim().toLowerCase()}|${loc}|${occurredAt.toISOString()}`;

  return crypto.createHash("sha256").update(rawString).digest("hex");
}
