/** "Q4 2026" for the quarter it is in Jakarta at `date`, so an "open this quarter" line never goes stale. */
export function jakartaQuarter(date = new Date()): string {
  const [year, month] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' })
    .format(date)
    .split('-');
  return `Q${Math.ceil(Number(month) / 3)} ${year}`;
}
