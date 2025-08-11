import { AuthProvider } from 'contexts/AuthContext';
import AppRouter from 'routes/AppRouter';
import { ToastProvider } from 'components/ToastProvider';
import { usePushNotifications } from 'features/notification/usePushNotifications';
import "styles/App.css";

// Component that uses the push notifications hook inside AuthProvider
function AppWithNotifications() {
  usePushNotifications();
  
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppWithNotifications />
    </AuthProvider>
  );
}