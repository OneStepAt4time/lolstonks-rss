/**
 * Locale data and utilities for the InteractiveGlobe component.
 * Maps Riot Games locales to their geographic coordinates and article counts.
 */

import type { LocalePin } from '../types/feed';

/**
 * 20 Riot Games locales with their geographic coordinates (lat, lon)
 * and representative flag emojis.
 */
export const localesData: LocalePin[] = [
  // North America
  { code: 'en-us', name: 'English (US)', flag: '🇺🇸', lat: 37.0902, lon: -95.7129, articleCount: 45 },
  { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧', lat: 51.5074, lon: -0.1278, articleCount: 32 },
  { code: 'es-mx', name: 'Español (México)', flag: '🇲🇽', lat: 23.6345, lon: -102.5528, articleCount: 28 },

  // Europe
  { code: 'es-es', name: 'Español (España)', flag: '🇪🇸', lat: 40.4168, lon: -3.7038, articleCount: 38 },
  { code: 'fr-fr', name: 'Français', flag: '🇫🇷', lat: 46.2276, lon: 2.2137, articleCount: 35 },
  { code: 'de-de', name: 'Deutsch', flag: '🇩🇪', lat: 51.1657, lon: 10.4515, articleCount: 31 },
  { code: 'it-it', name: 'Italiano', flag: '🇮🇹', lat: 41.8719, lon: 12.5674, articleCount: 42 },
  { code: 'pt-br', name: 'Português (Brasil)', flag: '🇧🇷', lat: -14.2350, lon: -51.9253, articleCount: 55 },
  { code: 'ru-ru', name: 'Русский', flag: '🇷🇺', lat: 55.7558, lon: 37.6173, articleCount: 29 },
  { code: 'tr-tr', name: 'Türkçe', flag: '🇹🇷', lat: 38.9637, lon: 35.2433, articleCount: 25 },
  { code: 'pl-pl', name: 'Polski', flag: '🇵🇱', lat: 52.2297, lon: 21.0122, articleCount: 22 },

  // Asia
  { code: 'ja-jp', name: '日本語', flag: '🇯🇵', lat: 35.6762, lon: 139.6503, articleCount: 68 },
  { code: 'ko-kr', name: '한국어', flag: '🇰🇷', lat: 37.5665, lon: 126.9780, articleCount: 72 },
  { code: 'zh-cn', name: '简体中文', flag: '🇨🇳', lat: 39.9042, lon: 116.4074, articleCount: 85 },
  { code: 'zh-tw', name: '繁體中文', flag: '🇹🇼', lat: 25.0330, lon: 121.5654, articleCount: 48 },

  // Southeast Asia
  { code: 'vi-vn', name: 'Tiếng Việt', flag: '🇻🇳', lat: 14.0583, lon: 108.2772, articleCount: 35 },
  { code: 'th-th', name: 'ภาษาไทย', flag: '🇹🇭', lat: 13.7563, lon: 100.5018, articleCount: 30 },
  { code: 'id-id', name: 'Bahasa Indonesia', flag: '🇮🇩', lat: -6.2088, lon: 106.8456, articleCount: 27 },
  { code: 'ph-ph', name: 'Filipino', flag: '🇵🇭', lat: 14.5995, lon: 120.9842, articleCount: 33 },

  // Middle East
  { code: 'ar-ae', name: 'العربية', flag: '🇦🇪', lat: 23.4241, lon: 53.8478, articleCount: 18 },
];

/**
 * Convert latitude and longitude to a 3D vector on a unit sphere.
 * Used for positioning pins on the Three.js globe.
 *
 * @param lat - Latitude in degrees (-90 to 90)
 * @param lon - Longitude in degrees (-180 to 180)
 * @param radius - Sphere radius (default 1)
 * @returns THREE.Vector3 with x, y, z coordinates
 */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius: number = 1
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

/**
 * Calculate the pin size based on article count.
 * More articles = larger pin.
 *
 * @param articleCount - Number of articles for this locale
 * @returns Size multiplier (0.5 to 2.0)
 */
export function getPinSize(articleCount: number): number {
  // Base size of 0.02, scales with article count
  const baseSize = 0.02;
  const maxSize = 0.05;
  const scaleFactor = Math.min(articleCount / 100, 1);

  return baseSize + (maxSize - baseSize) * scaleFactor;
}

/**
 * Get the pin color based on article count.
 * Uses a gradient from blue (low) to gold (medium) to red (high).
 *
 * @param articleCount - Number of articles for this locale
 * @returns Hex color string
 */
export function getPinColor(articleCount: number): string {
  if (articleCount < 30) {
    // Blue to cyan for low counts
    return '#0AC8B9'; // Hextech Blue
  } else if (articleCount < 50) {
    // Cyan to gold for medium counts
    return '#C89B3C'; // Primary Gold
  } else {
    // Gold to red for high counts
    return '#FF6B6B'; // Coral Red
  }
}

/**
 * Get locale data by code.
 *
 * @param code - Locale code (e.g., 'en-us', 'it-it')
 * @returns Locale data or undefined if not found
 */
export function getLocaleByCode(code: string): LocalePin | undefined {
  return localesData.find((locale) => locale.code === code);
}

/**
 * Get locales sorted by article count (descending).
 *
 * @returns Sorted array of locales
 */
export function getLocalesByPopularity(): LocalePin[] {
  return [...localesData].sort((a, b) => b.articleCount - a.articleCount);
}
