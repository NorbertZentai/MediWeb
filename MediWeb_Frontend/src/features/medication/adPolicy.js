export function shouldShowAd({ isPremium, medication } = {}) {
  if (isPremium) {
    return false;
  }

  if (!medication) {
    return false;
  }

  return true;
}
