import { toLocalDateString } from '../dateUtils';

describe('toLocalDateString', () => {
    it('returns the local calendar day, even at local midnight', () => {
        // A DatePicker helyi éjfélt ad vissza; UTC+1/+2 időzónában ez UTC szerint még az előző nap
        expect(toLocalDateString(new Date(2026, 0, 15))).toBe('2026-01-15');
        expect(toLocalDateString(new Date(2026, 6, 1, 0, 30))).toBe('2026-07-01');
    });

    it('pads month and day to two digits', () => {
        expect(toLocalDateString(new Date(2026, 8, 5))).toBe('2026-09-05');
    });
});
