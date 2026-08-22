export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return hrs + "h " + remainingMins + "m";
  }
  return mins + " min" + (secs > 0 ? " " + secs + "s" : "");
}

export function formatDurationShort(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return mins + " min";
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + secs.toString().padStart(2, "0");
}

export function formatProgress(current: number, total: number): string {
  return formatTime(current) + " / " + formatTime(total);
}

export function getProgressPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min((current / total) * 100, 100);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return diffDays + " days ago";
  if (diffDays < 30) return Math.floor(diffDays / 7) + " weeks ago";
  if (diffDays < 365) return Math.floor(diffDays / 30) + " months ago";
  return Math.floor(diffDays / 365) + " years ago";
}
