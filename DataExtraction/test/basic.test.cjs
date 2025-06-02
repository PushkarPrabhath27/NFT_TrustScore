// Basic test file using global Jest functions
console.log('Test file is running!');

test('basic test', () => {
  console.log('Test is running');
  expect(1 + 1).toBe(2);
});
