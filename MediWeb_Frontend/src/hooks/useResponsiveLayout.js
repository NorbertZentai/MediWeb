import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
};

export function useResponsiveLayout() {
    const { width } = useWindowDimensions();

    const isMobile = width < BREAKPOINTS.MOBILE;
    const isTablet = width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.TABLET;
    const isDesktop = width >= BREAKPOINTS.TABLET;

    return {
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        // Helper to determine column count for grids
        getNumColumns: (baseColumns = 3) => {
            if (isMobile) return 1;
            if (isTablet) return Math.min(2, baseColumns);
            return baseColumns;
        },
        // Helper for container width
        getContainerStyle: () => ({
            width: '100%',
            maxWidth: isMobile ? '100%' : 1000,
            paddingHorizontal: isMobile ? 16 : 32,
        })
    };
}
