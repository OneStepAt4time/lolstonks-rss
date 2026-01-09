import type { LocalePin } from '../types/feed';

/**
 * Locale data with geographic coordinates for 3D globe visualization.
 * Coordinates are approximate lat/lon values for each locale's region.
 */
export const localesData: LocalePin[] = [
  // Americas
  {
    code: 'en-us',
    name: 'English (US)',
    flag: '🇺🇸',
    lat: 37.0902,
    lon: -95.7129,
    articleCount: 234,
  },
  {
    code: 'es-mx',
    name: 'Spanish (MX)',
    flag: '🇲🇽',
    lat: 23.6345,
    lon: -102.5528,
    articleCount: 54,
  },
  {
    code: 'pt-br',
    name: 'Portuguese',
    flag: '🇧🇷',
    lat: -14.2350,
    lon: -51.9253,
    articleCount: 87,
  },

  // Europe
  {
    code: 'en-gb',
    name: 'English (UK)',
    flag: '🇬🇧',
    lat: 55.3781,
    lon: -3.4360,
    articleCount: 132,
  },
  {
    code: 'es-es',
    name: 'Spanish (ES)',
    flag: '🇪🇸',
    lat: 40.4637,
    lon: -3.7492,
    articleCount: 118,
  },
  {
    code: 'fr-fr',
    name: 'French',
    flag: '🇫🇷',
    lat: 46.2276,
    lon: 2.2137,
    articleCount: 132,
  },
  {
    code: 'de-de',
    name: 'German',
    flag: '🇩🇪',
    lat: 51.1657,
    lon: 10.4515,
    articleCount: 145,
  },
  {
    code: 'it-it',
    name: 'Italian',
    flag: '🇮🇹',
    lat: 41.8719,
    lon: 12.5674,
    articleCount: 98,
  },
  {
    code: 'ru-ru',
    name: 'Russian',
    flag: '🇷🇺',
    lat: 61.5240,
    lon: 105.3188,
    articleCount: 43,
  },
  {
    code: 'tr-tr',
    name: 'Turkish',
    flag: '🇹🇷',
    lat: 38.9637,
    lon: 35.2433,
    articleCount: 32,
  },
  {
    code: 'pl-pl',
    name: 'Polish',
    flag: '🇵🇱',
    lat: 51.9194,
    lon: 19.1451,
    articleCount: 28,
  },

  // Asia
  {
    code: 'ja-jp',
    name: 'Japanese',
    flag: '🇯🇵',
    lat: 36.2048,
    lon: 138.2529,
    articleCount: 189,
  },
  {
    code: 'ko-kr',
    name: 'Korean',
    flag: '🇰🇷',
    lat: 35.9078,
    lon: 127.7669,
    articleCount: 167,
  },
  {
    code: 'zh-cn',
    name: 'Chinese (S)',
    flag: '🇨🇳',
    lat: 35.8617,
    lon: 104.1954,
    articleCount: 76,
  },
  {
    code: 'zh-tw',
    name: 'Chinese (T)',
    flag: '🇹🇼',
    lat: 23.6978,
    lon: 120.9605,
    articleCount: 65,
  },
  {
    code: 'vi-vn',
    name: 'Vietnamese',
    flag: '🇻🇳',
    lat: 14.0583,
    lon: 108.2772,
    articleCount: 18,
  },
  {
    code: 'th-th',
    name: 'Thai',
    flag: '🇹🇭',
    lat: 15.8700,
    lon: 100.9925,
    articleCount: 15,
  },
  {
    code: 'id-id',
    name: 'Indonesian',
    flag: '🇮🇩',
    lat: -0.7893,
    lon: 113.9213,
    articleCount: 12,
  },
  {
    code: 'ph-ph',
    name: 'Filipino',
    flag: '🇵🇭',
    lat: 12.8797,
    lon: 121.7740,
    articleCount: 9,
  },

  // Middle East
  {
    code: 'ar-ae',
    name: 'Arabic',
    flag: '🇸🇦',
    lat: 23.4241,
    lon: 53.8478,
    articleCount: 21,
  },
];

/**
 * Convert latitude/longitude to 3D Cartesian coordinates on a sphere.
 * @param lat - Latitude in degrees
 * @param lon - Longitude in degrees
 * @param radius - Radius of the sphere (default: 1)
 * @returns [x, y, z] coordinates
 */
export function latLonToVector3(lat: number, lon: number, radius = 1): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

/**
 * Get locale by code.
 * @param code - Locale code (e.g., 'en-us')
 * @returns Locale data or undefined if not found
 */
export function getLocaleByCode(code: string): LocalePin | undefined {
  return localesData.find((locale) => locale.code === code);
}

/**
 * Get pin size based on article count.
 * Larger article counts get larger pins.
 * @param articleCount - Number of articles
 * @returns Size multiplier (0.02 to 0.08)
 */
export function getPinSize(articleCount: number): number {
  const minSize = 0.02;
  const maxSize = 0.08;
  const maxArticles = 250; // en-us has 234, so 250 is a good max

  const normalized = Math.min(articleCount / maxArticles, 1);
  return minSize + (maxSize - minSize) * normalized;
}

/**
 * Get pin color based on article count (heatmap style).
 * Higher article counts get warmer colors (gold).
 * @param articleCount - Number of articles
 * @returns Color hex string
 */
export function getPinColor(articleCount: number): string {
  if (articleCount > 200) return '#C89B3C'; // lol-gold (highest)
  if (articleCount > 150) return '#D4A94D'; // lol-gold-light
  if (articleCount > 100) return '#0AC8B9'; // lol-blue
  if (articleCount > 50) return '#2DD9CA'; // lol-blue-light
  return '#08A093'; // lol-blue-dark (lowest)
}
