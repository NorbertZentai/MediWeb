import { resolveApiBaseUrl } from "../apiBaseUrl";

describe("resolveApiBaseUrl", () => {
  it("uses EXPO_PUBLIC_API_URL and strips a trailing slash", () => {
    expect(
      resolveApiBaseUrl({ EXPO_PUBLIC_API_URL: "https://a.example/" }, "web")
    ).toBe("https://a.example");
  });

  it("falls back to EXPO_PUBLIC_API_BASE_URL when only that is set", () => {
    expect(
      resolveApiBaseUrl(
        { EXPO_PUBLIC_API_BASE_URL: "https://b.example" },
        "web"
      )
    ).toBe("https://b.example");
  });

  it("prefers EXPO_PUBLIC_API_URL when both are set", () => {
    expect(
      resolveApiBaseUrl(
        {
          EXPO_PUBLIC_API_URL: "https://a.example",
          EXPO_PUBLIC_API_BASE_URL: "https://b.example",
        },
        "web"
      )
    ).toBe("https://a.example");
  });

  it("falls back to the android default when both env vars are empty/undefined", () => {
    expect(
      resolveApiBaseUrl(
        { EXPO_PUBLIC_API_URL: "", EXPO_PUBLIC_API_BASE_URL: undefined },
        "android"
      )
    ).toBe("http://10.0.2.2:8080");
  });

  it("falls back to the web/default localhost when both env vars are empty/undefined", () => {
    expect(
      resolveApiBaseUrl(
        { EXPO_PUBLIC_API_URL: undefined, EXPO_PUBLIC_API_BASE_URL: "" },
        "web"
      )
    ).toBe("http://localhost:8080");
  });

  it("rewrites localhost to 10.0.2.2 on android even when set via env", () => {
    expect(
      resolveApiBaseUrl({ EXPO_PUBLIC_API_URL: "http://localhost:8080" }, "android")
    ).toBe("http://10.0.2.2:8080");
  });
});
