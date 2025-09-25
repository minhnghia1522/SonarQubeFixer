// Centralized constants for Issues route UI/filters
export const STATUS_OPTIONS = [
  'OPEN',
  'CONFIRMED',
  'FALSE_POSITIVE',
  'ACCEPTED',
  'FIXED',
] as const;
export type StatusOption = typeof STATUS_OPTIONS[number];

export const TYPE_OPTIONS = [
  'BUG',
  'VULNERABILITY',
  'CODE_SMELL',
] as const;
export type TypeOption = typeof TYPE_OPTIONS[number];