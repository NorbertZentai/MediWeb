// TODO(#78): shared accessibility test-support helper.
// Walks a rendered RNTL host tree (the object returned by `render(...).toJSON()`)
// and collects every host node that behaves like a pressable control (RN sets
// `focusable = onPress !== undefined && !disabled` on TouchableOpacity), so that
// screen a11y tests can assert accessibilityRole/accessibilityLabel/touch-target
// on all of them at once instead of repeating the same checks per node.
import { StyleSheet } from 'react-native';

export const MIN_TOUCH_TARGET = 44;

function collectInteractiveNodes(node, acc = []) {
  if (!node) return acc;
  if (Array.isArray(node)) {
    node.forEach((child) => collectInteractiveNodes(child, acc));
    return acc;
  }
  if (typeof node !== 'object') return acc;
  if (node.props && node.props.focusable === true) {
    acc.push(node);
  }
  collectInteractiveNodes(node.children, acc);
  return acc;
}

function effectiveTouchTarget(node) {
  const flat = StyleSheet.flatten(node.props.style) || {};
  const hitSlop = node.props.hitSlop || {};
  const hitW = (hitSlop.left || 0) + (hitSlop.right || 0);
  const hitH = (hitSlop.top || 0) + (hitSlop.bottom || 0);
  return {
    width: (flat.minWidth || flat.width || 0) + hitW,
    height: (flat.minHeight || flat.height || 0) + hitH,
  };
}

// Asserts every pressable node in `json` has a role, a non-empty label and an
// effective touch target >= MIN_TOUCH_TARGET x MIN_TOUCH_TARGET. Returns the
// collected nodes so callers can run further, node-specific assertions.
export function assertInteractiveNodesAreAccessible(json) {
  const nodes = collectInteractiveNodes(json);
  expect(nodes.length).toBeGreaterThan(0);
  nodes.forEach((node) => {
    expect(node.props.accessibilityRole).toBeTruthy();
    expect(node.props.accessibilityLabel).toBeTruthy();
    const target = effectiveTouchTarget(node);
    expect(target.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(target.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  });
  return nodes;
}
