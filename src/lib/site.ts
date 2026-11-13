export function siteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return value.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
