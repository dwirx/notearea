import { format, register } from 'timeago.js';

// Register Indonesian locale
const localeId = (_number: number, index: number): [string, string] => {
  const locales: [string, string][] = [
    ['baru saja', 'sebentar lagi'],
    ['%s detik lalu', 'dalam %s detik'],
    ['1 menit lalu', 'dalam 1 menit'],
    ['%s menit lalu', 'dalam %s menit'],
    ['1 jam lalu', 'dalam 1 jam'],
    ['%s jam lalu', 'dalam %s jam'],
    ['1 hari lalu', 'dalam 1 hari'],
    ['%s hari lalu', 'dalam %s hari'],
    ['1 minggu lalu', 'dalam 1 minggu'],
    ['%s minggu lalu', 'dalam %s minggu'],
    ['1 bulan lalu', 'dalam 1 bulan'],
    ['%s bulan lalu', 'dalam %s bulan'],
    ['1 tahun lalu', 'dalam 1 tahun'],
    ['%s tahun lalu', 'dalam %s tahun'],
  ];
  return locales[index];
};

register('id', localeId);

/**
 * Format timestamp to relative time in Indonesian
 */
export const timeAgo = (timestamp: number | Date): string => {
  return format(timestamp, 'id');
};

/**
 * Format timestamp to relative time with short format
 */
export const timeAgoShort = (timestamp: number | Date): string => {
  const now = Date.now();
  const time = typeof timestamp === 'number' ? timestamp : timestamp.getTime();
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'baru saja';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}j`;
  if (days < 7) return `${days}h`;
  if (days < 30) return `${Math.floor(days / 7)}mg`;
  if (days < 365) return `${Math.floor(days / 30)}bl`;
  return `${Math.floor(days / 365)}th`;
};

/**
 * Format date to full date string in Indonesian
 */
export const formatDate = (timestamp: number | Date): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format date and time in Indonesian
 */
export const formatDateTime = (timestamp: number | Date): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
