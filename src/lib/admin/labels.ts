export const productStatusLabel = {
  DRAFT: "Taslak",
  ACTIVE: "Yayında",
  ARCHIVED: "Arşiv",
} as const;

export function moneyInput(value: { toString(): string } | number) {
  return Number(value).toFixed(2).replace(".", ",");
}

export function isUniqueConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
