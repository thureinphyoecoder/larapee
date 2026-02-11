export function formatMoney(amount: number): string {
  return `${Number(amount || 0).toLocaleString()} MMK`;
}

export function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}
