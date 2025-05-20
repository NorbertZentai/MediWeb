import { AuthProvider } from 'contexts/AuthContext';
import AppRouter from 'routes/AppRouter';
import { ToastProvider } from 'components/ToastProvider';
import "styles/App.css";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}