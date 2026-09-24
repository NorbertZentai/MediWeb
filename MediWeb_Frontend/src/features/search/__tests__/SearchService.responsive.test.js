import { Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useSearchService } from '../SearchService';
import { useResponsiveLayout } from 'hooks/useResponsiveLayout';

jest.mock('hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: jest.fn(),
}));

jest.mock('../search.api', () => ({
  searchMedications: jest.fn().mockResolvedValue({ content: [], totalElements: 0, last: true }),
}));

const setMobile = (isMobile) => {
  useResponsiveLayout.mockReturnValue({ isMobile });
};

describe('useSearchService view mode', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    useResponsiveLayout.mockReset();
  });

  it('keeps the chosen view mode when the layout is not mobile', async () => {
    setMobile(false);
    const { result } = await renderHook(() => useSearchService());

    expect(result.current.viewMode).toBe('list');
    await act(async () => result.current.setViewMode('grid'));
    expect(result.current.viewMode).toBe('grid');
    await act(async () => result.current.setViewMode('list'));
    expect(result.current.viewMode).toBe('list');
  });

  it('forces list on a mobile layout and restores the choice when it widens', async () => {
    setMobile(false);
    const { result, rerender } = await renderHook(() => useSearchService());

    await act(async () => result.current.setViewMode('grid'));
    expect(result.current.viewMode).toBe('grid');

    setMobile(true);
    await rerender({});
    expect(result.current.viewMode).toBe('list');

    setMobile(false);
    await rerender({});
    expect(result.current.viewMode).toBe('grid');
  });

  it.each(['web', 'ios'])('gives list on a mobile layout with Platform.OS %s', async (os) => {
    jest.replaceProperty(Platform, 'OS', os);
    setMobile(true);
    const { result } = await renderHook(() => useSearchService());

    await act(async () => result.current.setViewMode('grid'));
    expect(result.current.viewMode).toBe('list');
  });
});
