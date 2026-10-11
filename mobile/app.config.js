/**
 * mobile/app.config.js — extends app.json with values that must come from
 * the environment (never hardcoded). GOOGLE_MAPS_ANDROID_API_KEY enables the
 * native Google map on Android builds; without it the Map tab shows a
 * placeholder instead of crashing. iOS uses Apple Maps (no key needed).
 */
module.exports = ({ config }) => {
  const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ["react-native-maps", androidMapsKey ? { androidGoogleMapsApiKey: androidMapsKey } : {}],
    ],
    extra: { ...(config.extra ?? {}), androidMapsEnabled: !!androidMapsKey },
  };
};
