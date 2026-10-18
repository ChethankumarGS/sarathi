import { shortName } from '../components/summary';
import { Disclosure } from '../components/Disclosure';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, Linking } from 'react-native';
import { Page, Title, Body, Notice, Button, useStyles } from '../components/ui';
import { useTheme } from '../theme';
import { useApp } from '../data/AppContext';
import { categories, levels, courses, Course, emptyProfile, StudentProfile, parseOptionalNumber } from '../assistant/profile';
import { understandProfile, isAiAvailable } from '../assistant/client';
import { matchScholarships, incomeOmissions, yearOmissionCount } from '../assistant/match';
import { dateLabel } from '../utils/indiaDates';

export function AssistantScreen({ navigation }: any) {
  const styles = useStyles(); const { colors } = useTheme(); const { catalogue } = useApp();
  const [kn, setKn] = useState(false), [profile, setProfile] = useState<StudentProfile>({ ...emptyProfile });
  const [income, setIncome] = useState(''), [marks, setMarks] = useState(''), [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false), [aiReviewed, setAiReviewed] = useState(false);
  const [aiOn, setAiOn] = useState(false);
  useEffect(() => { let live = true; void isAiAvailable().then(v => { if (live) setAiOn(v); }); return () => { live = false; }; }, []);
  const t = (en: string, ka: string) => kn ? ka : en;
  function update(patch: Partial<StudentProfile>) { setProfile(p => ({ ...p, ...patch })); setShowResults(false); }
  function choices<T extends string | number>(values: readonly T[], selected: T | null, onSelect: (v: T) => void, label?: (v: T) => string) {
    return <View style={styles.row}>{values.map(v => <Pressable key={String(v)} accessibilityRole="button" accessibilityState={{ selected: selected === v }} onPress={() => onSelect(v)} style={[styles.chip, selected === v && styles.selected]}><Text style={styles.chipText}>{label ? label(v) : v}</Text></Pressable>)}</View>;
  }
  function findMatches() {
    try {
      const annualIncome = parseOptionalNumber(income, 100_000_000), marksPercent = parseOptionalNumber(marks, 100);
      setProfile(p => ({ ...p, annualIncome, marksPercent }));
      if (profile.incomeAbove8L && annualIncome !== null && annualIncome <= 800000) throw new Error('Income band conflict');
      setError(''); setShowResults(true); setAiReviewed(false);
    } catch { setError(t('Use plain numbers: yearly income in rupees, marks from 0 to 100. Above ₹8 lakh requires income greater than ₹800000.', 'ಸಂಖ್ಯೆಗಳನ್ನು ಮಾತ್ರ ಬರೆಯಿರಿ: ವಾರ್ಷಿಕ ಆದಾಯ ರೂಪಾಯಿಗಳಲ್ಲಿ, ಅಂಕಗಳು 0 ರಿಂದ 100.')); }
  }
  async function readMessage() {
    setBusy(true); setError(''); setShowResults(false);
    try {
      const result = await understandProfile(message);
      // Treat extracted fields as suggestions. The student must review the form before matching.
      const course = result.course && courses[result.course];
      if (course && course.level && (result.level !== course.level || (result.year !== null && result.year > course.years))) {
        result.course = null; result.year = null;
      }
      setProfile(result); setIncome(result.annualIncome === null ? '' : String(result.annualIncome));
      setMarks(result.marksPercent === null ? '' : String(result.marksPercent)); setAiReviewed(true);
    } catch (e) {
      setError(t((e as Error).message === 'AI_NOT_CONFIGURED' ? 'Typing your details is not available right now. Use the questions below.' : 'AI could not read that right now. Use the form below.', 'ಈಗ AI ಲಭ್ಯವಿಲ್ಲ. ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.'));
    } finally { setBusy(false); }
  }
  const course = profile.course ? courses[profile.course] : null;
  const yearOmitted = yearOmissionCount(catalogue, profile);
  const omitted = incomeOmissions(catalogue, profile);
  const matches = showResults ? matchScholarships(catalogue, profile) : [];
  return <Page>
    <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'center' }]}><Title>{t('Scholarship assistant', 'ವಿದ್ಯಾರ್ಥಿವೇತನ ಸಹಾಯಕ')}</Title>{choices(['English', 'ಕನ್ನಡ'], kn ? 'ಕನ್ನಡ' : 'English', v => setKn(v === 'ಕನ್ನಡ'))}</View>
    <Body>{t('Find possible matches. Check the official rules before applying.', 'ನಿಮಗೆ ಹೊಂದಬಹುದಾದ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ಹುಡುಕಿ. ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಅಧಿಕೃತ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.')}</Body>
    <Notice>{t('The form works offline. It is not an AI eligibility decision. No profile is saved. Do not enter Aadhaar, phone, bank or document numbers.', 'ಈ ಪ್ರಶ್ನೆಗಳು ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಕೆಲಸ ಮಾಡುತ್ತವೆ. ಇದು AI ಅರ್ಹತಾ ನಿರ್ಧಾರವಲ್ಲ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಉಳಿಸುವುದಿಲ್ಲ. ಆಧಾರ್, ಫೋನ್ ಅಥವಾ ಬ್ಯಾಂಕ್ ಸಂಖ್ಯೆ ಬರೆಯಬೇಡಿ.')}</Notice>
    {aiOn && <View style={styles.card}>
      <Text style={styles.label}>{t('Optional: describe your studies', 'ಬೇಕಿದ್ದರೆ ನಿಮ್ಮ ವಿದ್ಯಾಭ್ಯಾಸದ ಬಗ್ಗೆ ಬರೆಯಿರಿ')}</Text>
      <TextInput accessibilityLabel={t('Describe your studies', 'ನಿಮ್ಮ ವಿದ್ಯಾಭ್ಯಾಸದ ವಿವರ')} multiline maxLength={800} style={[styles.input, { minHeight: 90 }]} placeholder={t('E.g. OBC, BE 2nd year, family income ₹1.5 lakh a year, 80%, fresh application', 'ಉದಾ: OBC, BE 2ನೇ ವರ್ಷ, ವಾರ್ಷಿಕ ಆದಾಯ ₹1.5 ಲಕ್ಷ, 80%')} placeholderTextColor={colors.muted} value={message} onChangeText={setMessage} />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent(!consent)} style={styles.row}><Text style={styles.body}>{consent ? '☑' : '☐'} {t('Send this message to the app server and Google Gemini to fill the form. Review it before matching.', 'ಪ್ರಶ್ನೆಗಳನ್ನು ತುಂಬಲು ಈ ಸಂದೇಶವನ್ನು ಆಪ್ ಸರ್ವರ್ ಮತ್ತು Google Gemini ಗೆ ಕಳುಹಿಸಲು ಒಪ್ಪುತ್ತೇನೆ. ನಂತರ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತೇನೆ.')}</Text></Pressable>
      <Button label={busy ? t('Reading...', 'ಓದುತ್ತಿದೆ...') : t('Fill with AI', 'AI ಮೂಲಕ ತುಂಬಿಸಿ')} onPress={() => void readMessage()} disabled={!consent || busy || message.trim().length < 5} secondary />
      <Text style={styles.muted}>{t('AI needs a configured server and internet. The form below does not.', 'AI ಗೆ ಸರ್ವರ್ ಮತ್ತು ಇಂಟರ್ನೆಟ್ ಬೇಕು. ಕೆಳಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಅವು ಬೇಡ.')}</Text>
    </View>}
    {aiReviewed && <Notice>{t('AI suggested these details. Check every field and correct mistakes before continuing.', 'AI ತುಂಬಿಸಿದ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ತಪ್ಪುಗಳನ್ನು ಸರಿಪಡಿಸಿ.')}</Notice>}
    <View style={styles.card}>
      <Text style={styles.label}>{t('1. Category (choose all that apply)', '1. ವರ್ಗ (ಅನ್ವಯಿಸುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆ ಮಾಡಿ)')}</Text>
      <View style={styles.row}>{categories.map(c => <Pressable key={c} accessibilityRole="checkbox" accessibilityState={{ checked: profile.categories.includes(c) }} style={[styles.chip, profile.categories.includes(c) && styles.selected]} onPress={() => update({ categories: profile.categories.includes(c) ? profile.categories.filter(x => x !== c) : [...profile.categories, c] })}><Text style={styles.chipText}>{c}</Text></Pressable>)}</View>
      <Text style={styles.label}>{t('2. Course', '2. ಕೋರ್ಸ್')}</Text>
      {choices(Object.keys(courses) as Course[], profile.course, v => update({ course: v, level: courses[v].level, year: null, lateralEntry: null }))}
      {profile.course === 'Other / different duration' && <><Text style={styles.label}>{t('Study level', 'ಶಿಕ್ಷಣದ ಹಂತ')}</Text>{choices(levels, profile.level, v => update({ level: v }))}</>}
      {profile.course && <><Text style={styles.label}>{t('3. Which year in your course?', '3. ಕೋರ್ಸ್‌ನ ಯಾವ ವರ್ಷದಲ್ಲಿ ಓದುತ್ತಿದ್ದೀರಿ?')}</Text>{choices(Array.from({ length: course?.years || 8 }, (_, i) => i + 1), profile.year, v => update({ year: v, lateralEntry: null }), v => t(`Year ${v}`, `${v}ನೇ ವರ್ಷ`))}</>}
      {profile.year === 2 && (profile.level === 'UG' || profile.level === 'diploma') && <><Text style={styles.label}>{t('Did you enter directly into 2nd year (lateral entry)?', 'ನೇರವಾಗಿ 2ನೇ ವರ್ಷಕ್ಕೆ ಪ್ರವೇಶ ಪಡೆದಿರಾ (lateral entry)?')}</Text>{choices(['yes', 'no', 'unknown'], profile.lateralEntry === null ? 'unknown' : profile.lateralEntry ? 'yes' : 'no', v => update({ lateralEntry: v === 'unknown' ? null : v === 'yes' }), v => t(v, v === 'yes' ? 'ಹೌದು' : v === 'no' ? 'ಇಲ್ಲ' : 'ಗೊತ್ತಿಲ್ಲ'))}</>}
      <Text style={styles.label}>{t('4. Annual family income (₹, optional)', '4. ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ (₹, ಐಚ್ಛಿಕ)')}</Text>
      {choices(['exact', 'above8L'], profile.incomeAbove8L ? 'above8L' : 'exact', v => { update({ incomeAbove8L: v === 'above8L', annualIncome: null }); setIncome(''); }, v => v === 'exact' ? t('Enter exact income', 'ನಿಖರ ಆದಾಯ ಬರೆಯಿರಿ') : t('Above ₹8 lakh', '₹8 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು'))}
      <TextInput accessibilityLabel="Annual family income" style={styles.input} keyboardType="numeric" maxLength={12} value={income} onChangeText={v => { setIncome(v); setShowResults(false); }} placeholder="150000" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>{t('5. Marks % (optional, not board percentile)', '5. ಅಂಕಗಳ ಶೇಕಡಾವಾರು (ಐಚ್ಛಿಕ, percentile ಅಲ್ಲ)')}</Text>
      <TextInput accessibilityLabel="Marks percentage" style={styles.input} keyboardType="decimal-pad" maxLength={6} value={marks} onChangeText={v => { setMarks(v); setShowResults(false); }} placeholder="80" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>{t('6. Application type', '6. ಅರ್ಜಿಯ ವಿಧ')}</Text>
      {choices(['fresh', 'renewal'] as const, profile.mode, v => update({ mode: v }), v => t(v === 'fresh' ? 'Fresh' : 'Renewal', v === 'fresh' ? 'ಹೊಸ ಅರ್ಜಿ' : 'ನವೀಕರಣ'))}
      <Button label={t('Find possible matches', 'ಹೊಂದಬಹುದಾದ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ')} onPress={findMatches} disabled={busy || !profile.categories.length || !profile.course || !profile.level || !profile.year || !profile.mode} />
      <Button label={t('Clear my details', 'ನನ್ನ ವಿವರಗಳನ್ನು ಅಳಿಸಿ')} secondary onPress={() => { setProfile({ ...emptyProfile }); setIncome(''); setMarks(''); setMessage(''); setConsent(false); setShowResults(false); setError(''); setAiReviewed(false); }} />
    </View>
    {!!error && <Text accessibilityRole="alert" style={[styles.body, { color: colors.error }]}>{error}</Text>}
    {showResults && <>
      <Title>{t(`${matches.length} possible matches`, `ಹೊಂದಬಹುದಾದ ${matches.length} ಯೋಜನೆಗಳು`)}</Title>
      <Body>{t(`List version ${catalogue.dataVersion} · ${catalogue.academicYear}. Category and study level narrow this list. Known income caps filter this list. Unknown income rules are not shown when income is selected. Year rules flag things to check, not approval.`, `ಪಟ್ಟಿ ಆವೃತ್ತಿ ${catalogue.dataVersion} · ${catalogue.academicYear}. ವರ್ಗ ಮತ್ತು ಶಿಕ್ಷಣದ ಹಂತದಿಂದ ಪಟ್ಟಿಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಇದು ಅರ್ಹತಾ ದೃಢೀಕರಣವಲ್ಲ.`)}</Body>
      {yearOmitted > 0 && <Notice>{t(`Not shown: ${yearOmitted} schemes do not match your fresh-entry year. Check renewal rules if you already receive a scholarship.`, `ತೋರಿಸಿಲ್ಲ: ನಿಮ್ಮ ಹೊಸ ಪ್ರವೇಶದ ವರ್ಷಕ್ಕೆ ಹೊಂದದ ${yearOmitted} ಯೋಜನೆಗಳು. ಈಗಾಗಲೇ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪಡೆಯುತ್ತಿದ್ದರೆ ನವೀಕರಣದ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`)}</Notice>}
      {(profile.annualIncome !== null || profile.incomeAbove8L) && <Notice>{t(`Not shown: ${omitted.capped.length} above listed income caps; ${omitted.unknown} with unverified or missing income rules.`, `ತೋರಿಸಿಲ್ಲ: ಆದಾಯ ಮಿತಿ ಮೀರಿದ ${omitted.capped.length}; ಆದಾಯ ನಿಯಮ ದೃಢಪಡದ ${omitted.unknown} ಯೋಜನೆಗಳು.`)}{[...new Set(omitted.capped.flatMap(s => s.eligibility.incomeRules.map(r => `${r.inclusive ? '≤' : '<'} ₹${r.maxINR.toLocaleString('en-IN')}`)))].map(cap => <Text key={cap} style={styles.muted}>{'\n'}{cap} / year</Text>)}</Notice>}
      {profile.incomeAbove8L && profile.annualIncome === null && <Notice>{t('Above ₹8 lakh is a broad band. Enter your exact income to check any higher cap. No-cap rules must be explicitly verified; unknown does not mean unlimited.', '₹8 ಲಕ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು ಎಂಬುದು ವಿಶಾಲ ವರ್ಗ. ಹೆಚ್ಚಿನ ಮಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲು ನಿಖರ ಆದಾಯ ಬರೆಯಿರಿ. ಗೊತ್ತಿಲ್ಲದ ಮಿತಿ ಎಂದರೆ ಮಿತಿ ಇಲ್ಲ ಎಂದಲ್ಲ.')}</Notice>}
      <Notice>{t('Marks alone cannot establish board percentile or merit selection. Gender, disability, worker-parent status, residence, institution and other conditions below still need checking. Scheme names and source text are currently in English.', 'ಅಂಕಗಳಿಂದ ಮಾತ್ರ percentile ಅಥವಾ ಆಯ್ಕೆಯನ್ನು ನಿರ್ಧರಿಸಲಾಗುವುದಿಲ್ಲ. ಲಿಂಗ, ಅಂಗವೈಕಲ್ಯ, ಪೋಷಕರ ಕೆಲಸ, ನಿವಾಸ ಮತ್ತು ಸಂಸ್ಥೆಯ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಬೇಕು. ಯೋಜನೆಯ ಹೆಸರು ಮತ್ತು ಮೂಲ ನಿಯಮಗಳು ಈಗ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿವೆ.')}</Notice>
      {!matches.length && <Body>{t('No matches in the saved list. Try Browse or check the official portals; this list is not exhaustive.', 'ಉಳಿಸಿದ ಪಟ್ಟಿಯಲ್ಲಿ ಹೊಂದಾಣಿಕೆ ಇಲ್ಲ. Browse ಅಥವಾ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಪರಿಶೀಲಿಸಿ; ಈ ಪಟ್ಟಿ ಸಂಪೂರ್ಣವಲ್ಲ.')}</Body>}
      {matches.map(m => <View key={m.scholarship.id} style={styles.card}>
        <Text style={[styles.title, { fontSize: 20, lineHeight: 27 }]}>{m.scholarship.id.startsWith('aicte-') ? `AICTE ${m.scholarship.id.includes('pragati') ? 'Pragati' : m.scholarship.id.includes('saksham') ? 'Saksham' : 'Swanath'} · ${m.scholarship.id.endsWith('degree') ? 'Degree' : 'Diploma'}` : shortName(m.scholarship)}</Text>
        <Text style={styles.muted}>{t('Possible match, not confirmed eligible', 'ಹೊಂದಬಹುದಾದ ಯೋಜನೆ, ಅರ್ಹತೆ ದೃಢಪಟ್ಟಿಲ್ಲ')}</Text>
        <Body>{m.income === 'above_listed_limit' ? t('Income is above at least one listed limit. Check its scope before applying.', 'ಆದಾಯವು ಪಟ್ಟಿಯ ಕನಿಷ್ಠ ಒಂದು ಮಿತಿಗಿಂತ ಹೆಚ್ಚು. ನಿಯಮವನ್ನು ಪರಿಶೀಲಿಸಿ.') : m.income === 'within_listed_limit' ? t('Income is within listed limits. Other conditions still apply.', 'ಆದಾಯವು ಪಟ್ಟಿಯ ಮಿತಿಯೊಳಗಿದೆ. ಇತರೆ ನಿಯಮಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.') : t('Income rule needs checking.', 'ಆದಾಯದ ನಿಯಮವನ್ನು ಪರಿಶೀಲಿಸಬೇಕು.')}</Body>
        {m.incomeRules.map((r, i) => <Text key={i} style={styles.muted}>{r.inclusive ? '≤' : '<'} ₹{r.maxINR.toLocaleString('en-IN')} / year · {r.appliesTo} · [{r.sourceId}] · {r.verification.replaceAll('_', ' ')}</Text>)}
        {m.entryYear !== 'not_structured' && <Body>{m.entryYear === 'outside_entry_rule' ? t('Your year does not match the listed fresh-entry rule. Check renewal instead.', 'ನಿಮ್ಮ ವರ್ಷವು ಹೊಸ ಪ್ರವೇಶದ ನಿಯಮಕ್ಕೆ ಹೊಂದುವುದಿಲ್ಲ. ನವೀಕರಣದ ನಿಯಮವನ್ನು ಪರಿಶೀಲಿಸಿ.') : m.entryYear === 'confirm_lateral_entry' ? t('2nd-year fresh entry requires lateral entry. Confirm this on the portal.', '2ನೇ ವರ್ಷದ ಹೊಸ ಅರ್ಜಿಗೆ lateral entry ಅಗತ್ಯ. ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.') : t('Your year matches the listed entry-year rule; other conditions still apply.', 'ನಿಮ್ಮ ವರ್ಷವು ಪ್ರವೇಶದ ವರ್ಷದ ನಿಯಮಕ್ಕೆ ಹೊಂದುತ್ತದೆ; ಇತರೆ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.')}</Body>}
        <Body>{m.deadline === 'verified_future' ? t(`Listed deadline: ${dateLabel(m.cycle!.closesOn!)}`, `ಪಟ್ಟಿಯ ಕೊನೆಯ ದಿನಾಂಕ: ${dateLabel(m.cycle!.closesOn!)}`) : m.deadline === 'past' ? t(`Listed deadline passed: ${dateLabel(m.cycle!.closesOn!)}`, `ಪಟ್ಟಿಯ ಕೊನೆಯ ದಿನಾಂಕ ಮುಗಿದಿದೆ: ${dateLabel(m.cycle!.closesOn!)}`) : m.deadline === 'unavailable' ? t('This application type is not available in the saved cycle.', 'ಉಳಿಸಿದ ಚಕ್ರದಲ್ಲಿ ಈ ವಿಧದ ಅರ್ಜಿ ಲಭ್ಯವಿಲ್ಲ.') : t('Deadline unverified. Check the official portal; do not rely on a provisional date.', 'ಕೊನೆಯ ದಿನಾಂಕ ದೃಢಪಟ್ಟಿಲ್ಲ. ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಪರಿಶೀಲಿಸಿ.')}</Body>
        <Text style={styles.muted}>{t('Deadline last checked: ', 'ದಿನಾಂಕ ಪರಿಶೀಲಿಸಿದ್ದು: ')}{m.cycle?.checkedAt || t('Unknown', 'ಗೊತ್ತಿಲ್ಲ')}</Text>
        <Disclosure label={t('rules and documents', 'ನಿಯಮಗಳು ಮತ್ತು ದಾಖಲೆಗಳು')}>
        {m.scholarship.eligibility.otherConditions.map((rule, i) => <Text key={i} style={styles.body}>• {rule}</Text>)}
        <Text style={styles.muted}>{t('Eligibility evidence: ', 'ಅರ್ಹತೆಯ ಮಾಹಿತಿ: ')}{m.scholarship.eligibility.verification.replaceAll('_', ' ')}</Text>
        {m.cycle && m.deadline !== 'unavailable' && <>
          <Text style={styles.label}>{m.cycle.checklistStatus === 'verified' ? t('Listed documents', 'ಪಟ್ಟಿಯ ದಾಖಲೆಗಳು') : t('Preparation list, not a verified upload checklist', 'ಸಿದ್ಧತಾ ಪಟ್ಟಿ, ದೃಢೀಕೃತ ದಾಖಲೆ ಪಟ್ಟಿ ಅಲ್ಲ')}</Text>
          {m.cycle.documents.map(d => <Text key={d.id} style={styles.muted}>• {d.label} ({d.requirement.replaceAll('_', ' ')}){d.condition ? ` · ${d.condition}` : ''} [{d.sourceIds.join(', ')}]</Text>)}
        </>}
        </Disclosure>
        <Button label={t('Details and sources', 'ವಿವರಗಳು ಮತ್ತು ಮೂಲಗಳು')} secondary onPress={() => navigation.navigate('Details', { id: m.scholarship.id, mode: profile.mode })} />
        {m.scholarship.links.officialSchemeUrl && <Button label={t('Official scheme page', 'ಅಧಿಕೃತ ಯೋಜನೆಯ ಪುಟ')} secondary onPress={() => void Linking.openURL(m.scholarship.links.officialSchemeUrl!)} />}
      </View>)}
    </>}
  </Page>;
}
