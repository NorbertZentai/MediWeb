import { AuthProvider } from './src/context/AuthContext';
import AppRouter from './src/routes/AppRouter';
import "./src/App.css";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}