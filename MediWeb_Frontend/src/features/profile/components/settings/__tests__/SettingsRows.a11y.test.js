import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { ToggleRow, PillGroup } from '../SettingsRows';
import { lightTheme, MIN_TOUCH_TARGET } from 'styles/theme';

function size(el) {
    const s = StyleSheet.flatten(el.props.style) || {};
    const h = el.props.hitSlop || {};
    return {
        w: Math.max(s.minWidth || 0, s.width || 0) + (h.left || 0) + (h.right || 0),
        h: Math.max(s.minHeight || 0, s.height || 0) + (h.top || 0) + (h.bottom || 0),
    };
}

const styles = {};

function Harness() {
    const [value, setValue] = useState(false);
    return (
        <ToggleRow title="Email értesítések" value={value} onValueChange={setValue} theme={lightTheme} styles={styles} />
    );
}

// Issue #91
describe('SettingsRows accessibility (#91)', () => {
    it('ToggleRow exposes a switch with the row title as label and a checked state that flips', async () => {
        await render(<Harness />);
        const sw = screen.getByRole('switch', { name: 'Email értesítések' });
        expect(sw.props.accessibilityLabel).toBe('Email értesítések');
        expect(sw.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));

        await fireEvent(sw, 'valueChange', true);
        expect(screen.getByRole('switch', { name: 'Email értesítések' }).props.accessibilityState)
            .toEqual(expect.objectContaining({ checked: true }));
    });

    it('PillGroup options are buttons labelled with their text and at least 44x44', async () => {
        await render(
            <PillGroup
                title="Téma"
                options={[{ value: 'a', label: 'Világos' }, { value: 'b', label: 'Sötét' }]}
                value="a"
                onSelect={jest.fn()}
                theme={lightTheme}
                styles={styles}
            />
        );
        const pill = screen.getByRole('button', { name: 'Világos' });
        expect(pill.props.accessibilityLabel).toBe('Világos');
        const { w, h } = size(pill);
        expect(w).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
        expect(h).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    });
});
