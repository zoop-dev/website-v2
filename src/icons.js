const CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@16/icons';

export const iconUrl = (slug) => `${CDN}/${encodeURIComponent(String(slug).toLowerCase())}.svg`;
