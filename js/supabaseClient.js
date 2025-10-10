<script type="module" src="../vendor/supabase-global.js?v=1"></script>
<script defer src="../js/supabaseClient.js?v=2"></script>
<script>
  (async () => {
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    let waited = 0;
    while (waited < 6000 && (!window.supabase || !window.sb || !sb.client)) { await wait(300); waited += 300; }
    if (!window.supabase) {
      const b = document.createElement('div'); b.style.cssText="position:fixed;left:0;right:0;top:0;background:#b00020;color:#fff;padding:10px 14px;font:14px system-ui;z-index:99999"; b.textContent="Supabase SDK missing. Check ../vendor/supabase-global.js tag."; document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(b));
    } else if (!window.sb || !sb.client) {
      const b = document.createElement('div'); b.style.cssText="position:fixed;left:0;right:0;top:0;background:#b00020;color:#fff;padding:10px 14px;font:14px system-ui;z-index:99999"; b.textContent="Supabase client missing. Check ../js/supabaseClient.js and your anon key."; document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(b));
    }
  })();
</script>


// FILE: /js/supabaseClient.js  (plain JS, no <script> tags)

// 1) PROJECT KEYS — REPLACE BOTH
const SUPABASE_URL = "https://gwiweanhxxwlvnmisbbl.supabase.co";  // your project URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3aXdlYW5oeHh3bHZubWlzYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjUxMjksImV4cCI6MjA3NTYwMTEyOX0.FaQeS9jH3WFgFGkSipjaj3lgPdm5Xoo-hGikXzWRqvg";  // Settings → API → Anonymous public

// 2) Wait until the SDK (window.supabase) is ready
function waitForSupabase(timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    if (window.supabase && typeof window.supabase.createClient === 'function') return resolve();
    const onReady = () => {
      if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.removeEventListener('supabase-ready', onReady);
        resolve();
      }
    };
    window.addEventListener('supabase-ready', onReady, { once: true });
    setTimeout(() => reject(new Error('SDK not ready (timeout)')), timeoutMs);
  });
}

// 3) Initialize client after SDK is ready
window.sb = window.sb || {};
(async () => {
  try {
    await waitForSupabase();
    sb.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });

    // Small helpers used by pages
    sb.statusLabel = (s) => ({ green:"Open / No wait", yellow:"Moderate wait", red:"Full / Busy" }[s] ?? s);
    sb.statusEmoji = (s) => ({ green:"🟢", yellow:"🟡", red:"🔴" }[s] ?? "❓");
    sb.dotClass    = (s) => ({ green:"dot-green", yellow:"dot-yellow", red:"dot-red" }[s] ?? "dot-red");
    sb.formatTime  = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return ""; } };
    sb.boardUrl    = () => new URL("./index.html", location.href).toString();
    sb.roomUrl     = (slug) => { const u = new URL(sb.boardUrl()); u.searchParams.set("room", slug); return u.toString(); };

    // Optional self-test (non-fatal)
    try {
      const { error } = await sb.client.from("rooms").select("id", { head: true, count: "exact" });
      if (error) console.warn("[supabaseClient] rooms head-select:", error.message);
    } catch(e) { console.warn("[supabaseClient] self-test:", e.message); }
  } catch (e) {
    console.error("[supabaseClient] init failed:", e.message);
  }
})();

// 4) Expose keys for diagnostics (optional)
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
