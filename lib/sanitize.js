// Sanitizing utilities (keine Funktionsänderung für Außenwelt)
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/expression\s*\(/gi, '');
}

function deepSanitize(data) {
  if (Array.isArray(data)) return data.map(deepSanitize);
  if (data && typeof data === 'object') {
    return Object.keys(data).reduce((acc, key) => {
      const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, '');
      acc[safeKey] = deepSanitize(data[key]);
      return acc;
    }, {});
  }
  return sanitizeString(data);
}

module.exports = { sanitizeString, deepSanitize };
