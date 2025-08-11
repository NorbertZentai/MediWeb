self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body || "Üzenet érkezett",
    icon: "/icon.png",
    badge: "/badge.png",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "MediWeb", options)
  );
});