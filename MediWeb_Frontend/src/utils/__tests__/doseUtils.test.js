import { formatDoseLabel } from '../doseUtils';

describe('formatDoseLabel', () => {
    it('formats a whole number amount without decimals', () => {
        expect(formatDoseLabel(1, 'tabletta')).toBe('1 tabletta');
    });

    it('formats a decimal amount using Hungarian comma', () => {
        expect(formatDoseLabel(2.5, 'ml')).toBe('2,5 ml');
    });

    it('does not add decimals for whole numbers', () => {
        expect(formatDoseLabel(3, 'db')).toBe('3 db');
    });

    it('returns empty string for null amount', () => {
        expect(formatDoseLabel(null, 'tabletta')).toBe('');
    });

    it('returns empty string for undefined amount', () => {
        expect(formatDoseLabel(undefined, 'tabletta')).toBe('');
    });

    it('returns empty string for zero amount', () => {
        expect(formatDoseLabel(0, 'tabletta')).toBe('');
    });

    it('returns empty string for negative amount', () => {
        expect(formatDoseLabel(-1, 'tabletta')).toBe('');
    });

    it('returns only the number when unit is missing', () => {
        expect(formatDoseLabel(2.5, undefined)).toBe('2,5');
        expect(formatDoseLabel(3, null)).toBe('3');
    });

    it('rounds to at most two decimals without trailing zeros', () => {
        expect(formatDoseLabel(0.125, 'g')).toBe('0,13 g');
    });
});
