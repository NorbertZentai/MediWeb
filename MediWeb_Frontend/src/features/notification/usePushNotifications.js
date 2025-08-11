import { useEffect, useContext } from "react";
import { registerServiceWorker } from "./push.utils";
import { subscribeToPush } from "./push.api";
import { AuthContext } from "contexts/AuthContext";

export function usePushNotifications() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Only try to subscribe if user is logged in
    if (!user) {
      return;
    }

    const initPush = async () => {
      try {
        const registration = await registerServiceWorker();
        await subscribeToPush(registration);
        console.log("✅ Push feliratkozás sikeres");
      } catch (err) {
        console.error("❌ Hiba push regisztráció közben:", err);
      }
    };

    initPush();
  }, [user]); // Depend on user state
}