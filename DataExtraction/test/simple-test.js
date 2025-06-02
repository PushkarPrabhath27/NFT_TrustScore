import { test, expect } from '@jest/globals';

console.log('Running simple test...');

test('simple test', () => {
  console.log('Inside test function');
  expect(1 + 1).toBe(2);
});
