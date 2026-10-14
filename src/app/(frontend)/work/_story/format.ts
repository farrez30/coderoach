const DAY = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' });
const MINUTE = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
});

/** "29 Jul 2026", read in WIB like everything else the studio dates. */
export const formatDay = (iso: string) => DAY.format(new Date(iso));

/** "14 Okt 2026, 12.17", for a time that matters to the hour. */
export const formatMinute = (iso: string) => MINUTE.format(new Date(iso));
