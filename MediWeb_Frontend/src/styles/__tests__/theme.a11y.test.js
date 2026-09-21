import * as theme from '../theme';

// Issue #78: styles/theme.js must export a shared MIN_TOUCH_TARGET = 44
// constant so touched styles across the app stop repeating the literal.
describe('theme MIN_TOUCH_TARGET (#78)', () => {
  it('exports a shared 44px minimum touch target constant', () => {
    expect(theme.MIN_TOUCH_TARGET).toBe(44);
  });
});
