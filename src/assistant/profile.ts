import { z } from 'zod';

export const categories = ['SC', 'ST', 'OBC', 'EBC', 'general', 'minority'] as const;
export const levels = ['1-5', '6-8', '9-10', 'PUC/11-12', 'ITI', 'diploma', 'UG', 'PG', 'PhD'] as const;
export const courses = {
  'BE/BTech': { level: 'UG', years: 4 },
  'Degree (3 years)': { level: 'UG', years: 3 },
  'Degree (4 years)': { level: 'UG', years: 4 },
  'PUC / Class 11-12': { level: 'PUC/11-12', years: 2 },
  'Diploma (3 years)': { level: 'diploma', years: 3 },
  'ITI (1 year)': { level: 'ITI', years: 1 },
  'ITI (2 years)': { level: 'ITI', years: 2 },
  'PG (2 years)': { level: 'PG', years: 2 },
  'Other / different duration': { level: null, years: 0 },
} as const;
export type Course = keyof typeof courses;
// No names, document numbers, bank details, phone numbers or addresses.
export const studentProfileSchema = z.object({
  course: z.enum(Object.keys(courses) as [Course, ...Course[]]).nullable(),
  year: z.number().int().min(1).max(8).nullable(),
  lateralEntry: z.boolean().nullable(),
  categories: z.array(z.enum(categories)).max(6),
  level: z.enum(levels).nullable(),
  incomeAbove8L: z.boolean(),
  annualIncome: z.number().finite().min(0).max(100_000_000).nullable(),
  marksPercent: z.number().finite().min(0).max(100).nullable(),
  mode: z.enum(['fresh', 'renewal']).nullable(),
}).strict();
export type StudentProfile = z.infer<typeof studentProfileSchema>;
export const emptyProfile: StudentProfile = {
  course: null, year: null, lateralEntry: null, categories: [], incomeAbove8L: false, level: null, annualIncome: null, marksPercent: null, mode: null,
};
export function parseOptionalNumber(value: string, max: number): number | null {
  if (!value.trim()) return null;
  if (!/^\d+(\.\d+)?$/.test(value.trim())) throw new Error('Enter a plain number.');
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) throw new Error('Number is outside the allowed range.');
  return n;
}
