import { z } from 'zod';

export const SonarQubeUrlSchema = z
  .string()
  .trim()
  .min(1, 'SonarQube URL is required')
  .refine(
    (v) => /^https?:\/\//i.test(v),
    'Invalid SonarQube URL: must start with http:// or https://'
  )
  .refine(
    // Basic sanity check to avoid obvious invalid hosts
    (v) => /^(https?:\/\/)[^\s]+$/i.test(v),
    'Invalid SonarQube URL: contains spaces or invalid characters'
  )
  .transform((v) => v.replace(/\/+$/, '')); // normalize: remove trailing slashes

export type SonarQubeUrl = z.infer<typeof SonarQubeUrlSchema>;

/**
 * Validate and normalize a SonarQube base URL string.
 * - Ensures http/https
 * - Trims whitespace
 * - Removes trailing slash
 */
export function parseSonarQubeUrl(input: unknown): SonarQubeUrl {
  return SonarQubeUrlSchema.parse(input);
}