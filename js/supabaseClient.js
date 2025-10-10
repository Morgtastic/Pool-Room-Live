// FILE: /js/supabaseClient.js  (PLAIN JS, no <script> tags)

// 1) PROJECT KEYS — REPLACE BOTH
const SUPABASE_URL = "https://gwiweanhxxwlvnmisbbl.supabase.co";     // ← your project URL
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_KEY_STARTS_WITH_eyJ";     // ← Anonymous public key

// 2) Wait until the SDK (window.supabase) is available
function whenSupabaseReady() {
  return new Promise((resolve, reject) => {
    if (window.supabase && typeof window.supabase.createClient === 'function') return resolve();
    const onReady = () => {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.removeEventListener('supabase-ready', onReady);
        resolve();
      }
    };
    window.addEventListener('supabase-ready', onReady);
    // Safety timeout (helps surface path/tag issues)
    setTimeout(() => {
      if (!window.supabase) reject(new Error("Supabase SDK still not loaded (check vendor/supabase-global.js tag)"));
    }, 8000);
  });
}

// 3) Initialize client after SDK is ready
window.sb = window.sb || {};
(async () => {
  try {
    await whenSupabaseReady();

    // Quick sanity on keys
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE_URL)) {
      console.error("[supabaseClient] SUPABASE_URL looks wrong:", SUPABASE_URL);
    }
    if (!/^eyJ/.test(SUPABASE_ANON_KEY)) {
      console.error("[supabaseClient] Anon key should start with 'eyJ…'");
    }

    sb.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });

    // Helpers used by pages
    sb.statusLabel = (s) => ({ green:"Open / No wait", yellow:"Moderate wait", red:"Full / Busy" }[s] ?? s);
    sb.statusEmoji = (s) => ({ green:"🟢", yellow:"🟡", red:"🔴" }[s] ?? "❓");
    sb.dotClass    = (s) => ({ green:"dot-green", yellow:"dot-yellow", red:"dot-red" }[s] ?? "dot-red");
    sb.formatTime  = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return ""; } };
    sb.boardUrl    = () => new URL("./index.html", location.href).toString();
    sb.roomUrl     = (slug) => { const u = new URL(sb.boardUrl()); u.searchParams.set("room", slug); return u.toString(); };

    // Tiny self-test
    try {
      const { error } = await sb.client.from("rooms").select("id", { head: true, count: "exact" });
      if (error) console.warn("[supabaseClient] rooms head-select error:", error.message);
    } catch(e) { console.warn("[supabaseClient] self-test exception:", e.message); }

  } catch (e) {
    console.error("[supabaseClient] Init failed:", e.message);
  }
})();

// Expose for diag pages (optional)
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
