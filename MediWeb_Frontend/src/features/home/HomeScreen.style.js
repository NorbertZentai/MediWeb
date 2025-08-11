import { StyleSheet } from "react-native";
import { theme } from 'styles/theme';

export const styles = StyleSheet.create ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    minHeight: '85vh',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    backgroundColor: '#66BB6A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});