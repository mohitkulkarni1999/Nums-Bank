/**
 * Formats a numeric value into the Indian Rupee (INR) currency system (e.g. ₹1,23,456.78)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const value = parseFloat(amount);
  if (isNaN(value)) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a Date object or ISO date string into a readable system format (e.g. 18 May 2026, 08:32 PM)
 * @param {Date|string} dateValue 
 * @returns {string}
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  
  // Format options
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${day} ${month} ${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Masks Aadhar numbers leaving only the last 4 digits visible
 * @param {string} aadhar 
 * @returns {string}
 */
export const maskAadhar = (aadhar) => {
  if (!aadhar) return '';
  return 'XXXX-XXXX-' + aadhar.slice(-4);
};

/**
 * Masks PAN numbers leaving a professional layout visible
 * @param {string} pan 
 * @returns {string}
 */
export const maskPan = (pan) => {
  if (!pan) return '';
  return pan.slice(0, 5) + 'XXXX' + pan.slice(-1);
};
