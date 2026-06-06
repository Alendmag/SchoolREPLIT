export function getApiErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.message || JSON.stringify(item)).join('، ');
  }
  if (detail && typeof detail === 'object') return detail.msg || detail.message || JSON.stringify(detail);
  return fallback;
}

export function cleanOptional(value) {
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}
