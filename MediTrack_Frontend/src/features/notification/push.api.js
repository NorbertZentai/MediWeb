import api from "api/config";
import { urlBase64ToUint8Array } from "./push.utils";

const PUBLIC_KEY = "BIL6J5Na_R5qzpqEENhz7bHHQ47M9pyiC9SkPHgAqIQQxhvvUL_nQDsGUehKy5Tt0VDnIfj_1hCdu3W2soV2MkU";

export async function subscribeToPush(registration) {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
    });

    const { endpoint, keys } = subscription.toJSON();

    await api.post("/api/push/subscribe", {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    console.log("✅ Push subscription elküldve");
  } catch (err) {
    if (err.response?.status === 401) {
      return;
    }

    console.error("❌ Push subscription hiba:", err);
    throw err;
  }
}