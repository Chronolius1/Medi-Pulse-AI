/**
 * Build-time defaults read from `import.meta.env`. Vite inlines every
 * `VITE_*` variable into the browser bundle, so these are public values —
 * never a secret. They only seed the settings a first-time visitor starts
 * with; anything the user saves in the Settings modal takes precedence.
 */
function readEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

export const ENV_GEMINI_API_KEY = readEnv('VITE_GEMINI_API_KEY');
