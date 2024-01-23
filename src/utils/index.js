/**
 * Format date time string to Indonesian locale.
 * @param {string} dateTimeString - date time string.
 */
const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString(
    'id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

/**
 * Capitalize the first letter of text.
 * @param {string} text - Text to be capitalized.
 */
const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export {
  formatDateTime,
  capitalize,
}
