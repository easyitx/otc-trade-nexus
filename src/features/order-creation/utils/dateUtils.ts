
// Function to get default expiry date (7 days from now)
export function getDefaultExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}

// Function to get currency symbol based on currency code
export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'USD':
    case 'USDT':
      return '$';
    case 'RUB':
      return '₽';
    case 'EUR':
      return '€';
    default:
      return '';
  }
}
