export const formatAppDateTime = (value, options = {}) => {
  if (!value) return '—';

  const stringValue = String(value);
  const utcValue = stringValue.includes('T')
    ? `${stringValue}${stringValue.endsWith('Z') ? '' : 'Z'}`
    : `${stringValue.replace(' ', 'T')}Z`;

  return new Date(utcValue).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options
  });
};

export const formatAppDate = (value) => formatAppDateTime(value, { timeStyle: undefined });
