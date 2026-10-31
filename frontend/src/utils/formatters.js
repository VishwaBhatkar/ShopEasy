/**
 * Format a numeric amount to Indian Rupee (INR) currency representation
 * with Indian number grouping (e.g. ₹1,499 or ₹1,20,000)
 * 
 * @param {number|string} amount 
 * @param {boolean} [showDecimals=false]
 * @returns {string} e.g. "₹1,499"
 */
export function formatINR(amount, showDecimals = false) {
  const numericAmount = Number(amount) || 0;

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: showDecimals ? 2 : 0,
      minimumFractionDigits: showDecimals ? 2 : 0
    }).format(numericAmount);
  } catch (e) {
    // Fallback Indian format regex
    const parts = numericAmount.toFixed(showDecimals ? 2 : 0).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }

    return `₹${integerPart}${decimalPart}`;
  }
}

/**
 * Capitalize first letter of category or title
 */
export function capitalizeWord(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
