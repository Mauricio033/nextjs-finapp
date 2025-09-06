function fractionDigitsFor(currency: string) {
  switch (currency) {
    case 'JPY':
    case 'KRW':
      return 0;
    case 'BHD':
    case 'JOD':
    case 'KWD':
      return 3;
    default:
      return 2;
  }
}

export function formatMoneyMinor(
  amountMinor: number,
  currency: string,
  locale: string = 'en-US'
) {
  const fd = fractionDigitsFor(currency);
  const amount = amountMinor / 10 ** fd;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: fd,
    maximumFractionDigits: fd,
    signDisplay: 'auto',
  }).format(amount);
}