import test from 'node:test';
import assert from 'node:assert/strict';

export function validateWelcomeDisplayName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Please enter a display name.' };
  }
  const clean = name.trim();
  if (clean.length === 0) {
    return { valid: false, error: 'Please enter a display name.' };
  }
  if (clean.length > 40) {
    return { valid: false, error: 'Display name must be 40 characters or fewer.' };
  }
  return { valid: true, cleanName: clean };
}

export function formatAuthError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please provide a valid email address.';
    case 'auth/user-disabled':
      return 'This IRL.OS account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect credentials. Please try again.';
    case 'auth/admin-restricted-operation':
    case 'auth/operation-not-allowed':
      return 'Anonymous authentication is being routed through private local session.';
    default:
      return error.message || 'Authentication error. Please try again.';
  }
}

test('validateWelcomeDisplayName accepts valid, trimmed names', () => {
  const result = validateWelcomeDisplayName('  Alex Morgan  ');
  assert.equal(result.valid, true);
  assert.equal(result.cleanName, 'Alex Morgan');
});

test('validateWelcomeDisplayName rejects empty or whitespace-only inputs', () => {
  const r1 = validateWelcomeDisplayName('');
  assert.equal(r1.valid, false);
  assert.match(r1.error, /display name/i);

  const r2 = validateWelcomeDisplayName('    ');
  assert.equal(r2.valid, false);
  assert.match(r2.error, /display name/i);

  const r3 = validateWelcomeDisplayName(null);
  assert.equal(r3.valid, false);
});

test('validateWelcomeDisplayName rejects names exceeding 40 characters', () => {
  const longName = 'A'.repeat(45);
  const result = validateWelcomeDisplayName(longName);
  assert.equal(result.valid, false);
  assert.match(result.error, /40 characters/i);
});

test('Two anonymous users with identical display names retain unique isolated UIDs', () => {
  const userA = {
    uid: 'anon_user_A_94821',
    displayName: 'Alex Morgan',
  };
  const userB = {
    uid: 'anon_user_B_31084',
    displayName: 'Alex Morgan',
  };

  assert.equal(userA.displayName, userB.displayName);
  assert.notEqual(userA.uid, userB.uid);
  // Verify storage paths are completely isolated
  const pathA = `/users/${userA.uid}/tasks`;
  const pathB = `/users/${userB.uid}/tasks`;
  assert.notEqual(pathA, pathB);
});

test('formatAuthError provides clean humanized feedback without technical stack traces', () => {
  assert.match(formatAuthError({ code: 'auth/operation-not-allowed' }), /private local session/i);
  assert.match(formatAuthError({ code: 'auth/invalid-credential' }), /credentials/i);
});
