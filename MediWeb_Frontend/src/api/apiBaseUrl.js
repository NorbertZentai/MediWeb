// Shared, pure API base URL resolver used by both src/api/config.js and
// src/utils/Logger.ts, so the two never drift out of sync again.
//
// Precedence:
//   1. env.EXPO_PUBLIC_API_URL (primary)
//   2. env.EXPO_PUBLIC_API_BASE_URL (backwards-compatible fallback)
//   3. platform-specific fallback: android -> http://10.0.2.2:8080,
//      everything else -> http://localhost:8080
//
// An env value is treated as absent if it is undefined, an empty string, or
// trims to an empty string. Trailing slashes are stripped from a resolved
// value before the Android rewrite is applied. On Android, localhost/
// 127.0.0.1 is always rewritten to 10.0.2.2 (host loopback is unreachable
// from the emulator) — this applies to both env vars, not just the
// hardcoded fallback.

const isUsableEnvValue = (value) =>
  typeof value === "string" && value.trim().length > 0;

const stripTrailingSlashes = (value) => value.replace(/\/+$/, "");

const applyAndroidLocalhostRewrite = (value, platformOs) => {
  if (platformOs !== "android") return value;
  if (!value.includes("localhost") && !value.includes("127.0.0.1")) {
    return value;
  }
  return value.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
};

const getFallbackUrl = (platformOs) =>
  platformOs === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";

/**
 * Resolve the API base URL from environment variables and the current
 * platform. Pure function — no react-native/Platform import so it stays
 * trivially unit-testable with plain string args.
 *
 * @param {Record<string, string | undefined>} env - e.g. process.env
 * @param {string} platformOs - e.g. Platform.OS ('android' | 'ios' | 'web')
 * @returns {string}
 */
export const resolveApiBaseUrl = (env, platformOs) => {
  const source = env || {};

  let resolved;
  if (isUsableEnvValue(source.EXPO_PUBLIC_API_URL)) {
    resolved = source.EXPO_PUBLIC_API_URL.trim();
  } else if (isUsableEnvValue(source.EXPO_PUBLIC_API_BASE_URL)) {
    resolved = source.EXPO_PUBLIC_API_BASE_URL.trim();
  } else {
    resolved = getFallbackUrl(platformOs);
  }

  resolved = stripTrailingSlashes(resolved);
  resolved = applyAndroidLocalhostRewrite(resolved, platformOs);

  return resolved;
};

export default resolveApiBaseUrl;
