# FILE: vendor/supabase-global.js
# TYPE: ES module
# WHY: Pulls the official SDK from a CDN and exposes window.supabase
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


# FILE: js/supabaseClient.js
# TYPE: plain JS (no <script> tags)
# TODO: Replace BOTH constants with your real values
const SUPABASE_URL = "https://gwiweanhxxwlvnmisbbl.supabase.co";   // <-- REPLACE if different
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3aXdlYW5oeHh3bHZubWlzYmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjUxMjksImV4cCI6MjA3NTYwMTEyOX0.FaQeS9jH3WFgFGkSipjaj3lgPdm5Xoo-hGikXzWRqvg"; // <-- REPLACE (Anonymous public)

function waitForSupabase(timeoutMs = 8000) {
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

window.sb = window.sb || {};
(async () => {
  try {
    await waitForSupabase();

    // Basic sanity
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(SUPABASE_URL)) {
      console.error("[supabaseClient] Bad SUPABASE_URL:", SUPABASE_URL);
    }
    if (!/^eyJ/.test(SUPABASE_ANON_KEY)) {
      console.error("[supabaseClient] Anon key should start with 'eyJ…'");
    }

    sb.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });

    // helpers used by pages
    sb.statusLabel = (s) => ({ green:"Open / No wait", yellow:"Moderate wait", red:"Full / Busy" }[s] ?? s);
    sb.statusEmoji = (s) => ({ green:"🟢", yellow:"🟡", red:"🔴" }[s] ?? "❓");
    sb.dotClass    = (s) => ({ green:"dot-green", yellow:"dot-yellow", red:"dot-red" }[s] ?? "dot-red");
    sb.formatTime  = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return ""; } };
    sb.boardUrl    = () => new URL("./index.html", location.href).toString();
    sb.roomUrl     = (slug) => { const u = new URL(sb.boardUrl()); u.searchParams.set("room", slug); return u.toString(); };

    // optional self-test
    try { await sb.client.from("rooms").select("id", { head: true, count: "exact" }); } catch {}
  } catch (e) {
    console.error("[supabaseClient] init failed:", e.message);
  }
})();

// optional: expose for diag
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;


# FILE: tools/sdk-check.html
# TYPE: HTML
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/><title>SDK Check</title>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <!-- tools page paths go UP one folder -->
  <script type="module" src="../vendor/supabase-global.js?v=1"></script>
  <script defer src="../js/supabaseClient.js?v=1"></script>
</head>
<body style="font-family:system-ui;max-width:760px;margin:24px auto;padding:16px">
  <h1>Supabase SDK & Client Check</h1>
  <pre id="out" style="white-space:pre-wrap;background:#111;color:#eee;padding:12px;border-radius:8px"></pre>
  <script>
    (async ()=>{
      const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
      let tries=0; while(tries<30 && (!window.supabase || !window.sb || !sb.client)){ await wait(200); tries++; }
      const out=document.getElementById('out');
      out.textContent = [
        'SDK present: '+!!window.supabase,
        'Client present: '+(!!window.sb && !!sb.client),
        'Client URL: '+(sb?.client?.rest?.url || '(n/a)')
      ].join('\n');
    })();
  </script>
</body>
</html>


# HEAD TAGS — VERIFY THESE (do NOT paste as files; edit your pages)

# On ROOT pages (index.html, admin.html) — inside <head>:
<script type="module" src="./vendor/supabase-global.js?v=1"></script>
<script defer src="./js/supabaseClient.js?v=1"></script>

# On TOOLS pages (/tools/...) — inside <head>:
<script type="module" src="../vendor/supabase-global.js?v=1"></script>
<script defer src="../js/supabaseClient.js?v=1"></script>
