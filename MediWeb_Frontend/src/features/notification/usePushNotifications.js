import { useEffect, useContext } from "react";
import { registerServiceWorker } from "./push.utils";
import { subscribeToPush } from "./push.api";
import { AuthContext } from "contexts/AuthContext";

export function usePushNotifications() {
  const authContext = useContext(AuthContext);
  
  // Safety check: if context is not available, exit early
  if (!authContext) {
    // Only warn in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn("AuthContext not available for push notifications");
    }
    return;
  }

  const { user } = authContext;

  useEffect(() => {
    // Only try to subscribe if user is logged in
    if (!user) {
      return;
    }

    const initPush = async () => {
      try {
        const registration = await registerServiceWorker();
        await subscribeToPush(registration);
        // Only log success in development mode
        if (process.env.NODE_ENV === 'development') {
          console.log("✅ Push feliratkozás sikeres");
        }
      } catch (err) {
        // Only log errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error("❌ Hiba push regisztráció közben:", err);
        }
      }
    };

    initPush();
  }, [user]); // Depend on user state
}