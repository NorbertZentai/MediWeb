import { Platform } from 'react-native';
import { lightTheme, darkTheme } from 'styles/theme';
import { createStyles } from '../AdminScreen.style';

describe('AdminScreen.style createStyles (issue #100)', () => {
    describe('isMobile: true', () => {
        const s = createStyles(lightTheme, { isMobile: true });

        it('uses compact card and spacing values', () => {
            expect(s.statCard.minWidth).toBe('46%');
            expect(s.statCard.flex).toBe(1);
            expect(s.contentInner.padding).toBe(14);
            expect(s.userMeta.flexDirection).toBe('column');
            expect(s.userMeta.gap).toBe(6);
            expect(s.syncBtn.flexGrow).toBe(1);
            expect(s.syncBtn.flexBasis).toBe('45%');
        });

        it('stacks config rows and stretches the input', () => {
            expect(s.configRow.flexDirection).toBe('column');
            expect(s.configRow.alignItems).toBe('flex-start');
            expect(s.configRow.gap).toBe(4);
            expect(s.configLabel.minWidth).toBeUndefined();
            expect(s.configInput.minWidth).toBeUndefined();
            expect(s.configInput.width).toBe('100%');
        });
    });

    describe('isMobile: false', () => {
        const s = createStyles(lightTheme, { isMobile: false });

        it('uses desktop card and spacing values', () => {
            expect(s.statCard.minWidth).toBe(170);
            expect(s.statCard.flex).toBeUndefined();
            expect(s.contentInner.padding).toBe(24);
            expect(s.userMeta.flexDirection).toBe('row');
            expect(s.userMeta.gap).toBe(12);
            expect(s.syncBtn.flexGrow).toBe(0);
            expect(s.syncBtn.flexBasis).toBeUndefined();
        });

        it('lays config rows out horizontally', () => {
            expect(s.configRow.flexDirection).toBe('row');
            expect(s.configRow.alignItems).toBe('center');
            expect(s.configRow.gap).toBe(12);
            expect(s.configLabel.minWidth).toBe(220);
            expect(s.configInput.minWidth).toBe(100);
            expect(s.configInput.width).toBeUndefined();
        });
    });

    it('defaults to the desktop layout when no options are passed', () => {
        expect(createStyles(lightTheme).statCard.minWidth).toBe(170);
    });

    it('expresses the tab-bar clearance via Platform.select', () => {
        const expected = Platform.select({ web: 48, default: 120 });
        expect(createStyles(lightTheme, { isMobile: true }).contentInner.paddingBottom).toBe(expected);
        expect(createStyles(lightTheme, { isMobile: false }).contentInner.paddingBottom).toBe(expected);
    });

    it.each([
        ['light', lightTheme],
        ['dark', darkTheme],
    ])('uses theme.colors.white for text on filled buttons (%s theme)', (_name, theme) => {
        const s = createStyles(theme, { isMobile: true });
        expect(s.filterBtnTextActive.color).toBe(theme.colors.white);
        expect(s.syncBtnText.color).toBe(theme.colors.white);
        expect(s.saveConfigBtnText.color).toBe(theme.colors.white);
    });
});
