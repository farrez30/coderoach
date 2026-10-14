import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { planClientsSync, type ExistingClient } from './clients';

const client = (over: Partial<ExistingClient> & Pick<ExistingClient, 'id' | 'name' | 'order'>): ExistingClient => ({
  listed: true,
  industry: 'fb',
  hasAdminData: false,
  ...over,
});

describe('planClientsSync', () => {
  test('creates what is missing, updates what moved, and never deletes what the admin set up', () => {
    const plan = planClientsSync(
      [
        client({ id: 1, name: 'Chicken Wow', order: 1 }),
        client({ id: 2, name: 'geprek wow', order: 2, hasAdminData: true }),
        client({ id: 3, name: 'Dummy Client', order: 3, hasAdminData: true }),
        client({ id: 4, name: 'Withdrawn', order: 4 }),
      ],
      [
        { name: 'Geprek Wow', industry: 'fb' },
        { name: 'Chicken Wow', industry: 'fb' },
        { name: 'Uruzin', industry: 'legal' },
      ],
    );
    assert.deepEqual(plan.create, [{ name: 'Uruzin', order: 3, listed: true, industry: 'legal' }]);
    assert.deepEqual(plan.update, [
      { id: 2, name: 'geprek wow', data: { order: 1 } },
      { id: 1, name: 'Chicken Wow', data: { order: 2 } },
      { id: 3, name: 'Dummy Client', data: { listed: false } },
    ]);
    assert.deepEqual(plan.keep, []);
    assert.deepEqual(plan.extra, [{ id: 3, name: 'Dummy Client' }]);
    assert.deepEqual(plan.remove, [{ id: 4, name: 'Withdrawn' }]);
  });

  test('lists a client that exists but was never listed, and sets its industry', () => {
    const plan = planClientsSync(
      [client({ id: 5, name: 'Uruzin', order: 1, listed: false, industry: null, hasAdminData: true })],
      [{ name: 'Uruzin', industry: 'legal' }],
    );
    assert.deepEqual(plan.update, [{ id: 5, name: 'Uruzin', data: { listed: true, industry: 'legal' } }]);
  });

  test('an unlisted extra is left alone', () => {
    const plan = planClientsSync([client({ id: 6, name: 'Old', order: 1, listed: false, hasAdminData: true })], []);
    assert.deepEqual(plan.update, []);
    assert.deepEqual(plan.extra, [{ id: 6, name: 'Old' }]);
  });

  test('a database already in step needs nothing', () => {
    const plan = planClientsSync(
      [client({ id: 7, name: 'Uruzin', order: 1, industry: 'legal', hasAdminData: true })],
      [{ name: 'Uruzin', industry: 'legal' }],
    );
    assert.deepEqual(plan, { create: [], update: [], keep: [{ id: 7, name: 'Uruzin' }], remove: [], extra: [] });
  });
});
