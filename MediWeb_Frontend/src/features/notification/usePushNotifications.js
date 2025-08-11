import { useEffect } from "react";
import { registerServiceWorker } from "./push.utils";
import { subscribeToPush } from "./push.api";

export function usePushNotifications() {
  useEffect(() => {
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
  }, []);
}