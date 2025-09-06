const dtf = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeZone: 'UTC',
});

export function formatDateUTC(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return dtf.format(d);
}