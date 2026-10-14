import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { planClientsSync } from './clients';

describe('planClientsSync', () => {
  test('creates what is missing, reorders what moved, and never deletes what the admin set up', () => {
    const plan = planClientsSync(
      [
        { id: 1, name: 'Chicken Wow', order: 1, hasAdminData: false },
        { id: 2, name: 'geprek wow', order: 2, hasAdminData: true },
        { id: 3, name: 'Dummy Client', order: 3, hasAdminData: true },
        { id: 4, name: 'Withdrawn', order: 4, hasAdminData: false },
      ],
      ['Geprek Wow', 'Chicken Wow', 'Uruzin'],
    );
    assert.deepEqual(plan.create, [{ name: 'Uruzin', order: 3 }]);
    assert.deepEqual(plan.reorder, [
      { id: 2, name: 'geprek wow', order: 1 },
      { id: 1, name: 'Chicken Wow', order: 2 },
    ]);
    assert.deepEqual(plan.keep, []);
    assert.deepEqual(plan.extra, [{ id: 3, name: 'Dummy Client' }]);
    assert.deepEqual(plan.remove, [{ id: 4, name: 'Withdrawn' }]);
  });

  test('a database already in step needs nothing', () => {
    const plan = planClientsSync([{ id: 7, name: 'Uruzin', order: 1, hasAdminData: true }], ['Uruzin']);
    assert.deepEqual(plan, { create: [], reorder: [], keep: [{ id: 7, name: 'Uruzin' }], remove: [], extra: [] });
  });
});
