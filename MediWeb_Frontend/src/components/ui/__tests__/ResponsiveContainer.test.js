jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import React from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import useWindowDimensionsMock from 'react-native/Libraries/Utilities/useWindowDimensions';
import ResponsiveContainer from '../ResponsiveContainer';

function mockWidth(width) {
  useWindowDimensionsMock.mockReturnValue({ width, height: 800 });
}

function renderContainer(props) {
  render(
    <ResponsiveContainer testID="rc" {...props}>
      <Text>content</Text>
    </ResponsiveContainer>
  );
  return StyleSheet.flatten(screen.getByTestId('rc').props.style);
}

function renderContainerStandalone(props) {
  const utils = render(
    <ResponsiveContainer testID="rc-standalone" {...props}>
      <Text>content</Text>
    </ResponsiveContainer>
  );
  const style = StyleSheet.flatten(
    utils.getByTestId('rc-standalone').props.style
  );
  utils.unmount();
  return style;
}

describe('ResponsiveContainer breakpoint behaviour', () => {
  it('renders full width, 16px padding and no maxWidth clamp below 768px', () => {
    mockWidth(375);
    const style = renderContainer({});

    expect(style.width).toBe('100%');
    expect(style.paddingHorizontal).toBe(16);
    expect(style.maxWidth).toBeUndefined();
  });

  it('renders the resolved maxWidth, 32px padding and centering at 900px', () => {
    mockWidth(900);
    const style = renderContainer({ maxWidth: 'content' });

    expect(style.maxWidth).toBe(1000);
    expect(style.paddingHorizontal).toBe(32);
    expect(style.alignSelf).toBe('center');
  });

  it('renders the resolved maxWidth, 32px padding and centering at 1440px', () => {
    mockWidth(1440);
    const style = renderContainer({ maxWidth: 'wide' });

    expect(style.maxWidth).toBe(1400);
    expect(style.paddingHorizontal).toBe(32);
    expect(style.alignSelf).toBe('center');
  });
});

describe('ResponsiveContainer maxWidth resolution', () => {
  it.each([
    ['narrow', 560],
    ['content', 1000],
    ['wide', 1400],
  ])('resolves named size "%s" to %ipx', (name, expected) => {
    mockWidth(1024);
    const style = renderContainer({ maxWidth: name });

    expect(style.maxWidth).toBe(expected);
  });

  it('accepts a raw number for maxWidth', () => {
    mockWidth(1024);
    const style = renderContainer({ maxWidth: 720 });

    expect(style.maxWidth).toBe(720);
  });
});

describe('ResponsiveContainer prop overrides', () => {
  it('drops paddingHorizontal when padded={false}', () => {
    mockWidth(1024);
    const style = renderContainer({ padded: false });

    expect(style.paddingHorizontal).toBeUndefined();
  });

  it('drops alignSelf when center={false}', () => {
    mockWidth(1024);
    const style = renderContainer({ center: false });

    expect(style.alignSelf).toBeUndefined();
  });

  it('lets a caller-supplied style win over the computed values', () => {
    mockWidth(1024);
    const style = renderContainer({ style: { maxWidth: 42 } });

    expect(style.maxWidth).toBe(42);
  });
});

describe('ResponsiveContainer platform parity', () => {
  it('produces the same flattened style on web and native at the same width', () => {
    mockWidth(900);

    jest.replaceProperty(Platform, 'OS', 'web');
    const webStyle = renderContainerStandalone({ maxWidth: 'content' });

    jest.replaceProperty(Platform, 'OS', 'ios');
    const nativeStyle = renderContainerStandalone({ maxWidth: 'content' });

    expect(webStyle).toEqual(nativeStyle);
  });
});
