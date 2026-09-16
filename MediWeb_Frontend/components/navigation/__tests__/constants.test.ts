import { describe, expect, it } from '@jest/globals';
import { getTabBarColors } from '../constants';
import { Colors } from '@/src/styles/Colors';

describe('getTabBarColors', () => {
  it('light színsémában a Colors.light tab bar tokeneket adja vissza', () => {
    const colors = getTabBarColors('light');

    expect(colors.background).toBe(Colors.light.tabBarBackground);
    expect(colors.activeText).toBe(Colors.light.tabBarActiveText);
    expect(colors.indicator).toBe(Colors.light.tabBarIndicator);
  });

  it('dark színsémában a Colors.dark tab bar tokeneket adja vissza', () => {
    const colors = getTabBarColors('dark');

    expect(colors.background).toBe(Colors.dark.tabBarBackground);
    expect(colors.activeText).toBe(Colors.dark.tabBarActiveText);
    expect(colors.indicator).toBe(Colors.dark.tabBarIndicator);
  });
});
