// /js/supabaseClient.js  (PLAIN JS — no <script> tags, no SQL)
const SUPABASE_URL = "https://gwiweanhxxwlvnmisbbl.supabase.co";  // ← your project URL
const SUPABASE_ANON_KEY = "PASTE-YOUR-ANON-KEY-HERE";             // ← Settings → API → Anonymous public

if (!window.supabase) {
  console.error("Supabase SDK not loaded. Check the script tag for @supabase/supabase-js@2 in your HTML.");
}

window.sb = window.sb || {};
sb.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  realtime: { params: { eventsPerSecond: 10 } }
});

// Shared helpers used across pages
sb.statusLabel = (s) => ({ green: "Open / No wait", yellow: "Moderate wait", red: "Full / Busy" }[s] ?? s);
sb.statusEmoji = (s) => ({ green: "🟢", yellow: "🟡", red: "🔴" }[s] ?? "❓");
sb.dotClass = (s) => ({ green: "dot-green", yellow: "dot-yellow", red: "dot-red" }[s] ?? "dot-red");
sb.formatTime = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return ""; } };
sb.boardUrl = () => new URL("./index.html", window.location.href).toString();
sb.roomUrl = (slugOrId) => { const u = new URL(sb.boardUrl()); u.searchParams.set("room", slugOrId); return u.toString(); };

// Expose for diagnostics
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
