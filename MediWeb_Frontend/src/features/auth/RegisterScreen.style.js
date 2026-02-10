import { StyleSheet } from "react-native";
import { theme } from 'styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    padding: 20,
    borderRadius: theme.borderRadius.sm,
    ...theme.shadows.md,
  },
  title: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: theme.colors.backgroundCard,
    padding: theme.components.input.padding,
    borderRadius: theme.components.input.borderRadius,
    fontSize: theme.fontSize.base,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: theme.fontSize.base,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.fontWeight.bold,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  checkbox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  linkText: {
    color: theme.colors.primary,
    marginTop: 16,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
    textDecorationLine: 'underline',
  }
});
