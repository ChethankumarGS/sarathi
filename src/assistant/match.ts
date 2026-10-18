import { checkIncome } from '../data/incomeEligibility';
import { Scholarship, Catalogue } from '../types/scholarship';
import { StudentProfile, studentProfileSchema } from './profile';
import { deadlinePassed } from '../utils/indiaDates';

export type IncomeSignal = 'within_listed_limit' | 'above_listed_limit' | 'unknown';
export interface Match {
  scholarship: Scholarship;
  cycle: Scholarship['cycles'][number] | undefined;
  income: IncomeSignal;
  entryYear: 'not_structured' | 'within_entry_rule' | 'outside_entry_rule' | 'confirm_lateral_entry';
  incomeRules: Scholarship['eligibility']['incomeRules'];
  deadline: 'verified_future' | 'past' | 'unverified' | 'unavailable';
}
export function matchScholarships(catalogue: Catalogue, input: StudentProfile, now = Date.now()): Match[] {
  const profile = studentProfileSchema.parse(input);
  // Category and level are discovery labels, not an eligibility decision.
  if (!profile.categories.length || !profile.level || !profile.mode) return [];
  return catalogue.scholarships
    .filter(s => s.categories.some(c => profile.categories.includes(c as StudentProfile['categories'][number])))
    .filter(s => s.eligibility.levels.includes(profile.level!))
    .filter(s => profile.annualIncome === null && !profile.incomeAbove8L || checkIncome(s, profile.annualIncome ?? 800000, profile.annualIncome === null && profile.incomeAbove8L) === 'allowed')
    .map(s => {
      const cycle = s.cycles.find(c => c.academicYear === catalogue.academicYear && c.mode === profile.mode);
      // Keep the original rule scope and evidence visible after the income filter.
      const incomeRules = s.eligibility.incomeRules.filter(r => r.basis === 'annual_family_income');
      const income: IncomeSignal = profile.annualIncome === null || !incomeRules.length ? 'unknown'
        : incomeRules.every(r => r.inclusive ? profile.annualIncome! <= r.maxINR : profile.annualIncome! < r.maxINR)
          ? 'within_listed_limit' : 'above_listed_limit';
      const deadline: Match['deadline'] = !cycle || cycle.status === 'not_applicable' ? 'unavailable'
        : cycle.status !== 'verified' || !cycle.closesOn ? 'unverified'
        : deadlinePassed(cycle.closesOn, now) ? 'past' : 'verified_future';
      // Only this explicit catalogue rule is interpreted. Other year rules remain unstructured.
      const hasEntryRule = s.id.startsWith('aicte-') && /first year|first-year/i.test(s.eligibility.otherConditions.join(' '));
      const entryYear: Match['entryYear'] = !hasEntryRule || profile.mode === 'renewal' || profile.year === null ? 'not_structured'
        : profile.year === 1 || (profile.year === 2 && profile.lateralEntry === true) ? 'within_entry_rule'
        : profile.year === 2 && profile.lateralEntry === null ? 'confirm_lateral_entry' : 'outside_entry_rule';
      return { scholarship: s, cycle, income, incomeRules, deadline, entryYear };
    })
    .filter(m => m.entryYear !== 'outside_entry_rule' && m.deadline !== 'unavailable')
    .sort((a, b) => {
      const rank = (m: Match) => (m.deadline === 'unavailable' ? 20 : m.deadline === 'past' ? 10 : 0)
        + (m.entryYear === 'outside_entry_rule' ? 5 : 0)
        + (m.income === 'above_listed_limit' ? 5 : m.income === 'unknown' ? 1 : 0);
      return rank(a) - rank(b) || a.scholarship.id.localeCompare(b.scholarship.id);
    });
}

export function incomeOmissions(catalogue: Catalogue, profile: StudentProfile) {
  const candidates = catalogue.scholarships.filter(s => s.categories.some(c => profile.categories.includes(c as StudentProfile['categories'][number])) && (!profile.level || s.eligibility.levels.includes(profile.level)));
  if (profile.annualIncome === null && !profile.incomeAbove8L) return { capped: [], unknown: 0 };
  const decide = (s: Scholarship) => checkIncome(s, profile.annualIncome ?? 800000, profile.annualIncome === null && profile.incomeAbove8L);
  return { capped: candidates.filter(s => decide(s) === 'over_cap'), unknown: candidates.filter(s => decide(s) === 'unknown').length };
}

export function yearOmissionCount(catalogue: Catalogue, profile: StudentProfile) {
  if (profile.mode !== 'fresh' || profile.year === null) return 0;
  const withoutYear = matchScholarships(catalogue, { ...profile, year: null });
  return withoutYear.filter(m => m.scholarship.id.startsWith('aicte-') && /first year|first-year/i.test(m.scholarship.eligibility.otherConditions.join(' '))
    && (profile.year! > 2 || profile.year === 2 && profile.lateralEntry === false)).length;
}
