import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isCalendarDate, reminderTimes, deadlinePassed } from '../src/utils/indiaDates';
import { catalogueSchema } from '../src/data/catalogueSchema';
import seed from '../assets/data/scholarships.2026-27.json';

test('invalid dates cannot roll over into a reminder', () => {
  for (const date of ['2026-02-30', '2026-13-01', 'garbage', '2026-2-01']) {
    assert.equal(isCalendarDate(date), false);
    assert.deepEqual(reminderTimes(date, [1], 0), []);
    assert.equal(deadlinePassed(date, 0), true);
    assert.equal(catalogueSchema.safeParse({ ...seed, publishedAt: date }).success, false);
  }
  assert.equal(isCalendarDate('2028-02-29'), true);
  assert.equal(isCalendarDate('2026-02-29'), false);
});

test('bad offsets are ignored and the deadline stays open until India midnight', () => {
  assert.deepEqual(reminderTimes('2026-10-31', [1, 1, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER], 0), ['2026-10-30T03:30:00.000Z']);
  assert.equal(deadlinePassed('2026-10-31', Date.parse('2026-10-31T23:59:59+05:30')), false);
  assert.equal(deadlinePassed('2026-10-31', Date.parse('2026-11-01T00:00:00+05:30')), true);
});
