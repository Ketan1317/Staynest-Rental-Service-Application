export function formatRent(n?: number): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export function getOwnerId(ownerId: any): string | undefined {
  if (!ownerId) return undefined;
  if (typeof ownerId === "string") return ownerId;
  return ownerId._id;
}
