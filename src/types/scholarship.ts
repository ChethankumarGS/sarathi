export type Verification = 'official_current' | 'official_prior_cycle' |
  'institution_notice' | 'secondary_only' | 'unverified';
export type ApplicationMode = 'fresh' | 'renewal';
export type DeadlineStatus = 'verified' | 'verify_on_portal' | 'not_applicable';

export interface Catalogue {
  schemaVersion: number;
  dataVersion: number;
  academicYear: '2026-27';
  publishedAt: string;
  scholarships: Scholarship[];
}
export interface Scholarship {
  id: string;                   // stable, never reuse
  familyId?: string;            // links degree/diploma variants
  name: string;
  authority: string;
  geography: { state: 'KA'; national: boolean; domicileRule: string };
  benefitType: 'scholarship' | 'fee_reimbursement' | 'hostel' | 'prize';
  categories: string[];         // discovery labels, not full eligibility
  eligibility: {
    casteSubcategories?: string[];
    minorityCommunities?: string[];
    levels: string[];
    incomeRules: Array<{
      appliesTo: string;
      basis: 'annual_family_income' | 'monthly_parent_salary';
      maxINR: number;
      inclusive: boolean;
      sourceId: string;
      verification: Verification;
    }>;
    incomeRuleStatus: 'verified' | 'unknown' | 'explicitly_no_limit';
    otherConditions: string[];
    verification: Verification;
  };
  benefits: Array<{
    appliesTo: string;          // category/course/year/hosteller status
    kind: 'fixed' | 'capped' | 'fee_based' | 'in_kind' | 'unknown';
    amountINR: number | null;
    unit: 'year' | 'month' | 'one_time' | 'course' | 'not_applicable';
    description: string;
    sourceIds: string[];
    verification: Verification;
  }>;
  cycles: Array<{
    academicYear: string;
    mode: ApplicationMode;
    opensOn: string | null;     // ISO local calendar dates
    closesOn: string | null;
    closesAt: string | null;    // null unless official time stated
    timezone: 'Asia/Kolkata';
    status: DeadlineStatus;
    sourceIds: string[];
    checkedAt: string;
    documents: Array<{
      id: string;
      label: string;
      requirement: 'required' | 'conditional' | 'preparation_only';
      condition?: string;
      sourceIds: string[];
      verification: Verification;
    }>;
    checklistStatus: 'verified' | 'provisional';
  }>;
  links: {
    officialSchemeUrl: string | null;
    applicationUrl: string | null;
    applicationLinkType: 'exact_scheme' | 'shared_portal' | 'unverified';
    fallbackNoticeUrl: string | null;
    checkedAt: string;
  };
  sources: Array<{
    id: string; url: string; publisher: string;
    documentDate: string | null; checkedAt: string;
    cycleCovered: string | null; verification: Verification;
  }>;
}
export interface LocalChecklist {
  scholarshipId: string; academicYear: string; mode: ApplicationMode;
  checkedDocumentIds: string[];
}
export interface LocalReminder {
  id: string; scholarshipId: string; academicYear: string;
  mode: ApplicationMode; deadlineSnapshot: string;
  notificationIds: string[]; scheduledFor: string[];
}
export interface ReminderPreference extends LocalReminder { offsets: number[]; customDate?: string; unavailable?: boolean; }
