import moment from 'moment-timezone';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const parseDateOnlyToUTC = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Convert a date to UTC+7 timezone
 * @param {Date|string} date - The date to convert
 * @returns {Date} - Date in UTC+7
 */
export const convertToUTC7 = (date) => {
  if (!date) return date;

  // Keep date-only values stable across timezones (avoid shifting to previous day).
  if (typeof date === 'string' && DATE_ONLY_REGEX.test(date)) {
    return parseDateOnlyToUTC(date);
  }
  
  const momentDate = moment(date).tz('Asia/Ho_Chi_Minh');
  return momentDate.toDate();
};

/**
 * Get current time in UTC+7
 * @returns {Date} - Current date/time in UTC+7
 */
export const getNowUTC7 = () => {
  return moment().tz('Asia/Ho_Chi_Minh').toDate();
};

/**
 * Format date for display in UTC+7
 * @param {Date} date - The date to format
 * @param {string} format - Moment format string
 * @returns {string} - Formatted date string
 */
export const formatDateUTC7 = (date, format = 'DD/MM/YYYY HH:mm:ss') => {
  if (!date) return '';
  return moment(date).tz('Asia/Ho_Chi_Minh').format(format);
};

/**
 * Convert dates in an object to UTC+7
 * @param {Object} obj - Object containing date fields
 * @param {Array} dateFields - Array of field names that contain dates
 * @returns {Object} - Object with dates converted to UTC+7
 */
export const convertObjectDatesToUTC7 = (obj, dateFields) => {
  const result = { ...obj };
  dateFields.forEach(field => {
    if (result[field]) {
      result[field] = convertToUTC7(result[field]);
    }
  });
  return result;
};
