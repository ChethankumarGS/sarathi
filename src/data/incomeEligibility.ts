import { Scholarship } from '../types/scholarship';
export type IncomeDecision = 'allowed' | 'over_cap' | 'unknown';
export function checkIncome(s: Scholarship, annualIncome: number, strictlyAbove = false): IncomeDecision {
  if (!Number.isFinite(annualIncome) || annualIncome < 0) return 'unknown';
  if (s.eligibility.incomeRuleStatus === 'explicitly_no_limit') return s.eligibility.verification === 'official_current' ? 'allowed' : 'unknown';
  const rules = s.eligibility.incomeRules;
  if (s.eligibility.incomeRuleStatus !== 'verified' || !rules.length) return 'unknown';
  // Never translate monthly salary into annual family income or treat old evidence as current.
  if (rules.some(r => r.basis !== 'annual_family_income' || r.verification !== 'official_current')) return 'unknown';
  if (rules.some(r => strictlyAbove ? annualIncome >= r.maxINR : r.inclusive ? annualIncome > r.maxINR : annualIncome >= r.maxINR)) return 'over_cap';
  return 'allowed';
}
// A band gives only a lower bound. It is discovery, never an exact-income eligibility verdict.
export const incomeBandMinimum = (band: string) => ({ '100000': 0, '250000': 100000, '450000': 250000, '800000': 450000, above800000: 800000 }[band] ?? 0);
