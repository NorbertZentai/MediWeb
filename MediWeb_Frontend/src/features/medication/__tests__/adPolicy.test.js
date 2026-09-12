import { shouldShowAd } from "../adPolicy";

describe("adPolicy shouldShowAd", () => {
  const medication = { id: 1, name: "Aspirin" };

  it("premium felhasználónál mindig false", () => {
    expect(shouldShowAd({ isPremium: true, medication })).toBe(false);
  });

  it("nem prémium felhasználónál true, ha van gyógyszer adatlap", () => {
    expect(shouldShowAd({ isPremium: false, medication })).toBe(true);
  });

  it("hiányzó medication esetén false", () => {
    expect(shouldShowAd({ isPremium: false, medication: undefined })).toBe(false);
  });

  it("hiányzó medication esetén false akkor is, ha prémium felhasználó", () => {
    expect(shouldShowAd({ isPremium: true, medication: null })).toBe(false);
  });
});
