import { AuthProvider } from 'contexts/AuthContext';
import AppRouter from 'routes/AppRouter';
import { ToastProvider } from 'components/ToastProvider';
import { usePushNotifications } from 'features/notification/usePushNotifications';
import "styles/App.css";

export default function App() {
  usePushNotifications();

  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}