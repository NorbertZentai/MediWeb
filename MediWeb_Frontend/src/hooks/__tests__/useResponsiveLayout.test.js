jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import { renderHook } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import {
  useResponsiveLayout,
  CONTAINER_MAX_WIDTHS,
  BREAKPOINTS,
} from '../useResponsiveLayout';

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

describe('useResponsiveLayout breakpoints', () => {
  it('flags 375px as mobile only', async () => {
    mockWidth(375);
    const { result } = await renderHook(() => useResponsiveLayout());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.getNumColumns(3)).toBe(1);
  });

  it('flags 900px as tablet only', async () => {
    mockWidth(900);
    const { result } = await renderHook(() => useResponsiveLayout());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.getNumColumns(3)).toBe(2);
  });

  it('flags 1440px as desktop only', async () => {
    mockWidth(1440);
    const { result } = await renderHook(() => useResponsiveLayout());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.getNumColumns(3)).toBe(3);
  });
});

describe('CONTAINER_MAX_WIDTHS', () => {
  it('exports the documented named sizes (issue #75)', () => {
    expect(CONTAINER_MAX_WIDTHS).toEqual({
      narrow: 560,
      content: 1000,
      wide: 1400,
    });
  });

  it('mobile breakpoint stays at 768px', () => {
    expect(BREAKPOINTS.MOBILE).toBe(768);
  });
});
