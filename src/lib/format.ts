export const fmtAED = (n: number, currency: string = "AED") =>
  `${currency} ${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const fmtNum = (n: number) =>
  (n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export const todayLong = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

export const relativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
};

export const newId = (prefix: string) => {
  const r = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().split("-")[0]
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${r}`;
};
