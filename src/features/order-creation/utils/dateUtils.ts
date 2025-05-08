
// Function to get default expiry date (7 days from now)
export function getDefaultExpiryDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}
