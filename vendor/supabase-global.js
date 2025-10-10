// /vendor/supabase-global.js  (ES module loader)
export default (async function load() {
  try {
    const mod = await import('https://esm.sh/@supabase/supabase-js@2?bundle&target=es2019');
    window.supabase = { createClient: mod.createClient };
  } catch (e) {
    const mod = await import('https://unpkg.com/@supabase/supabase-js@2?module');
    window.supabase = { createClient: mod.createClient };
  }
  window.dispatchEvent(new Event('supabase-ready'));
})();
