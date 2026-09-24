import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import StatisticsTab from '../StatisticsTab';
import { ThemeContext } from 'contexts/ThemeContext';
import { lightTheme } from 'styles/theme';
import { assertInteractiveNodesAreAccessible } from 'test-utils/a11yTreeWalk';

jest.mock('utils/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock('features/profile/profile.api', () => ({
  getCategoryStatistics: jest.fn(),
  getComplianceStatistics: jest.fn(),
  getMissedDoseStatistics: jest.fn(),
  getPeakIntakeTimes: jest.fn(),
  getTrendStatistics: jest.fn(),
}));

jest.mock('react-native-chart-kit', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Stub = () => React.createElement(View, { testID: 'chart' });
  return { LineChart: Stub, PieChart: Stub, BarChart: Stub, ProgressChart: Stub };
});

const api = require('features/profile/profile.api');

const PERIODS = ['Heti', 'Havi', 'Negyedéves'];

async function renderTab() {
  await render(
    <ThemeContext.Provider value={{ theme: lightTheme, isDark: false, toggleTheme: jest.fn() }}>
      <StatisticsTab />
    </ThemeContext.Provider>
  );
  await screen.findByText('Compliance ráta');
}

const period = (label) => screen.getByRole('button', { name: `${label} időszak` });

describe('StatisticsTab accessibility (#112)', () => {
  beforeEach(() => {
    api.getComplianceStatistics.mockResolvedValue({ rate: 0.8, takenDoses: 8, totalDoses: 10 });
    api.getTrendStatistics.mockResolvedValue([{ label: 'H', value: 0.8 }]);
    api.getCategoryStatistics.mockResolvedValue([{ label: 'Fájdalom', value: 3 }]);
    api.getMissedDoseStatistics.mockResolvedValue({ labels: ['H'], data: [1] });
    api.getPeakIntakeTimes.mockResolvedValue({ labels: ['H'], data: [1] });
  });

  it('passes the interactive-node walker', async () => {
    await renderTab();
    assertInteractiveNodesAreAccessible(screen.toJSON());
  });

  it('exposes every period option as a labelled button', async () => {
    await renderTab();
    PERIODS.forEach((label) => expect(period(label)).toBeTruthy());
  });

  it('moves the selected state when another period is pressed', async () => {
    await renderTab();
    expect(period('Havi').props.accessibilityState.selected).toBe(true);
    expect(period('Heti').props.accessibilityState.selected).toBe(false);

    await fireEvent.press(period('Heti'));
    await screen.findByText('Compliance ráta');

    expect(period('Heti').props.accessibilityState.selected).toBe(true);
    expect(period('Havi').props.accessibilityState.selected).toBe(false);
    assertInteractiveNodesAreAccessible(screen.toJSON());
  });
});
