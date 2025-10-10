// FILE: /vendor/supabase-global.js
// TYPE: ES module. It imports the SDK and exposes a browser-global `window.supabase`.

async function load() {
  try {
    // Primary CDN
    const mod = await import('https://esm.sh/@supabase/supabase-js@2?bundle&target=es2019');
    window.supabase = { createClient: mod.createClient };
  } catch (e) {
    // Fallback CDN
    const mod = await import('https://unpkg.com/@supabase/supabase-js@2?module');
    window.supabase = { createClient: mod.createClient };
  }
  // Signal readiness
  window.dispatchEvent(new Event('supabase-ready'));
}
load();
