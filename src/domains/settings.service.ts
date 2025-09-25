import { parseSonarQubeUrl } from '../schemas/settings';

/**
 * Settings service for retrieving validated SonarQube URL from localStorage.
 * - Returns a normalized URL without trailing slash
 * - Returns null if missing or invalid
 */
export function getSonarQubeUrl(): string | null {
  const raw = localStorage.getItem('sonarqubeUrl');
  if (!raw) return null;
  try {
    return parseSonarQubeUrl(raw);
  } catch {
    return null;
  }
}