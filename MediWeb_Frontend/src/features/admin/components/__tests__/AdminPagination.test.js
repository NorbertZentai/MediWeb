import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { AdminPagination } from '../AdminShared';

function target(node) {
    const flat = StyleSheet.flatten(node.props.style) || {};
    const slop = node.props.hitSlop || {};
    return {
        w: (flat.minWidth || flat.width || 0) + (slop.left || 0) + (slop.right || 0),
        h: (flat.minHeight || flat.height || 0) + (slop.top || 0) + (slop.bottom || 0),
    };
}

describe('AdminPagination', () => {
    it('nem jelenít meg semmit egy oldalnál', async () => {
        const { toJSON } = await render(<AdminPagination page={0} totalPages={1} onChange={jest.fn()} />);
        expect(toJSON()).toBeNull();
    });

    it('az első oldalon az Előző oldal gomb letiltott', async () => {
        await render(<AdminPagination page={0} totalPages={3} onChange={jest.fn()} />);
        const prev = screen.getByRole('button', { name: 'Előző oldal' });
        expect(prev.props.accessibilityState?.disabled ?? prev.props['aria-disabled']).toBe(true);
        const next = screen.getByRole('button', { name: 'Következő oldal' });
        expect(next.props.accessibilityState?.disabled).toBeFalsy();
        expect(screen.getByText('1 / 3')).toBeTruthy();
    });

    it('az utolsó oldalon a Következő oldal gomb letiltott', async () => {
        await render(<AdminPagination page={2} totalPages={3} onChange={jest.fn()} />);
        const next = screen.getByRole('button', { name: 'Következő oldal' });
        expect(next.props.accessibilityState?.disabled ?? next.props['aria-disabled']).toBe(true);
    });

    it('a Következő oldal gomb az onChange(1)-et hívja', async () => {
        const onChange = jest.fn();
        await render(<AdminPagination page={0} totalPages={3} onChange={onChange} />);
        await fireEvent.press(screen.getByRole('button', { name: 'Következő oldal' }));
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it('az érintési felület legalább 44x44', async () => {
        await render(<AdminPagination page={1} totalPages={3} onChange={jest.fn()} />);
        for (const name of ['Előző oldal', 'Következő oldal']) {
            const t = target(screen.getByRole('button', { name }));
            expect(t.w).toBeGreaterThanOrEqual(44);
            expect(t.h).toBeGreaterThanOrEqual(44);
        }
    });
});
