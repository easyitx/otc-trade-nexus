
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

// Format percentage with sign for display
export function formatPercentage(value: number): string {
  return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
}

// Format currency value with appropriate symbol and locale
export function formatCurrency(value: number | string, currency: string): string {
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(numericValue)) return '0.00';
  
  return `${getCurrencySymbol(currency)}${numericValue.toLocaleString(undefined, { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2 
  })}`;
}
