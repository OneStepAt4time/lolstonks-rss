const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = Date.now();
  const diff = now - date.getTime();

  if (diff < 0 || isNaN(diff)) return 'Just now';

  if (diff < MINUTE) return 'Just now';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins}m ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }

  const currentYear = new Date().getFullYear();
  const articleYear = date.getFullYear();

  if (articleYear === currentYear) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
