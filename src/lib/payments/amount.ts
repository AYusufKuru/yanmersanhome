export function canonicalAmount(value: { toString(): string } | number) {
  const raw = value.toString();
  const negative = raw.startsWith("-");
  const [whole, frac = ""] = raw.replace("-", "").split(".");
  const text = `${whole}.${(frac + "00").slice(0, 2)}`;
  return negative ? `-${text}` : text;
}
